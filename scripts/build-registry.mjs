// Generates the TanStack Table v9 registry from the hand-maintained v8 one.
//
// registry.json (v8, hand-edited) is the source of truth for which files make
// up each example. For every item this writes a `<name>-v9` twin that points
// at the ported sources under src/components/v9 / src/routes/v9, staged into
// registry-v9/ with imports rewritten so the files work in a consumer's
// project (real `@tanstack/react-table` package, no docs-site aliases).
//
//   npm run registry:build
//     1. node scripts/build-registry.mjs          stage v9 files + registry-v9.json
//     2. shadcn build registry.json               v8 items → public/r
//     3. shadcn build registry-v9.json -o registry-v9/dist
//     4. node scripts/build-registry.mjs publish  copy v9 items into public/r and
//                                                 merge them into its index
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { basename, dirname, extname, join } from 'node:path'

const STAGING = 'registry-v9'
const DIST = join(STAGING, 'dist')
const REACT_TABLE_V9_RANGE = '^9.2.4'

if (process.argv[2] === 'publish') {
  const index = JSON.parse(readFileSync('public/r/registry.json', 'utf8'))
  const v9Index = JSON.parse(readFileSync(join(DIST, 'registry.json'), 'utf8'))
  for (const file of readdirSync(DIST)) {
    if (file !== 'registry.json') copyFileSync(join(DIST, file), join('public/r', file))
  }
  index.items = [...index.items.filter((i) => !i.name.endsWith('-v9')), ...v9Index.items]
  writeFileSync('public/r/registry.json', JSON.stringify(index, null, 2) + '\n')
  console.log(`Published ${v9Index.items.length} v9 items to public/r/`)
  process.exit(0)
}

const registry = JSON.parse(readFileSync('registry.json', 'utf8'))
const featuresSource = readFileSync('src/lib/table-v9-features.ts', 'utf8')

const stripExt = (file) => basename(file, extname(file))

function toV9Path(path) {
  const v9 = path
    .replace(/^src\/components\//, 'src/components/v9/')
    .replace(/^src\/routes\//, 'src/routes/v9/')
  // Shared, version-agnostic files (ssr/data.ts, ui/icons/*) have no v9 twin.
  return existsSync(v9) ? v9 : path
}

function rewriteImports(source, { isRoute, siblings }) {
  let out = source.replaceAll('@tanstack/react-table-v9', '@tanstack/react-table')

  out = out.replace(
    /(from\s+)(['"])((?:\.\.?\/)+ui\/[^'"]+|#\/components\/ui\/[^'"]+)\2/g,
    (_m, from, q, spec) =>
      `${from}${q}#/components/ui/${spec.split('ui/').pop()}${q}`,
  )

  out = out.replace(
    /(from\s+)(['"])(#\/lib\/table-v9-features(?:\.ts)?)\2/g,
    (_m, from, q) => `${from}${q}./features${q}`,
  )

  out = out.replace(
    /(from\s+)(['"])((?:\.\.\/)+[^'"]+|#\/components\/v9\/[^'"]+)\2/g,
    (m, from, q, spec) => {
      const target = siblings.get(stripExt(spec.split('/').pop()))
      return target ? `${from}${q}./${target}${q}` : m
    },
  )

  out = out.replaceAll('#/routes/v9/', '#/routes/')
  out = out.replaceAll('#/components/v9/', '#/components/')
  if (isRoute) out = out.replace(/createFileRoute\('\/v9\//g, "createFileRoute('/")
  return out
}

rmSync(STAGING, { recursive: true, force: true })

const v9Items = registry.items.map((item) => {
  const name = `${item.name}-v9`
  const dir = join(STAGING, item.name)

  const mapped = item.files.map((file) => {
    const isRoute = file.path.startsWith('src/routes/')
    const sourcePath = toV9Path(file.path)
    const targetBase = stripExt(file.target)
    return { file, isRoute, sourcePath, targetBase }
  })

  const siblings = new Map(
    mapped.filter((m) => !m.isRoute).flatMap((m) => [
      [stripExt(m.sourcePath), m.targetBase],
      [stripExt(m.file.path), m.targetBase],
    ]),
  )

  const files = mapped.map(({ file, isRoute, sourcePath }) => {
    const staged = join(dir, isRoute ? 'routes' : '', basename(file.target))
    mkdirSync(dirname(staged), { recursive: true })
    const shared = sourcePath === file.path && !file.path.includes('/v9/')
    const source = readFileSync(sourcePath, 'utf8')
    writeFileSync(
      staged,
      shared
        ? // e.g. ssr/data.ts imports './pagination-example/columns', but installed
          // items are flat, so the sibling lives at './columns'.
          source.replace(/(['"])\.\/[\w-]+-example\//g, '$1./')
        : rewriteImports(source, { isRoute, siblings }),
    )
    return { path: staged, type: file.type, target: file.target }
  })

  const featuresStaged = join(dir, 'features.ts')
  writeFileSync(
    featuresStaged,
    featuresSource.replaceAll('@tanstack/react-table-v9', '@tanstack/react-table'),
  )
  files.push({
    path: featuresStaged,
    type: 'registry:component',
    target: `@components/tables/${item.name}/features.ts`,
  })

  return {
    ...item,
    name,
    title: `${item.title} (v9)`,
    files,
    // The v8 items pin ^8 (npm's `latest` is now v9); the twins swap in the v9 range
    dependencies: (item.dependencies ?? []).map((dep) =>
      dep.startsWith('@tanstack/react-table@')
        ? `@tanstack/react-table@${REACT_TABLE_V9_RANGE}`
        : dep,
    ),
  }
})

writeFileSync(
  'registry-v9.json',
  JSON.stringify({ ...registry, name: `${registry.name}-v9`, items: v9Items }, null, 2) + '\n',
)
console.log(`Staged ${v9Items.length} v9 registry items in ${STAGING}/`)
