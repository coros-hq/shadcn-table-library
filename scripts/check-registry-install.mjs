// Installs every published registry item into a clean consumer project with the
// real shadcn CLI, then type-checks what landed. This is what a user does when
// they copy an install command from the docs, so it catches problems no unit
// test can: a missing dependency, a wrong version range, an import that only
// resolves inside this repo, a broken v9 twin.
//
//   npm run registry:build          build public/r first
//   npm run registry:check          check every item (v8 and v9 twins)
//   npm run registry:check -- --only tree-table,logs-table-v9
//   npm run registry:check -- --keep    keep the temp project for debugging
//
// Needs network access (npm, and ui.shadcn.com for the shadcn/ui primitives).
import { spawn } from 'node:child_process'
import {
  appendFileSync,
  createReadStream,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { extname, join } from 'node:path'

const REGISTRY_DIR = 'public/r'
const args = process.argv.slice(2)
const keep = args.includes('--keep')
const onlyArg = args.indexOf('--only')
const only = onlyArg >= 0 ? new Set(args[onlyArg + 1].split(',')) : null

// Items that ship a TanStack Start route (createServerFn, loaders) can only be
// type-checked inside a Start project, so they are installed but not compiled.
const SKIP_TYPECHECK = new Set(
  JSON.parse(readFileSync('registry.json', 'utf8'))
    .items.filter((item) =>
      item.files.some((file) => file.path.startsWith('src/routes/')),
    )
    .flatMap((item) => [item.name, `${item.name}-v9`]),
)

// Packages every consumer project already has; anything else an item's own
// files import must be listed in the item's `dependencies`.
const PROVIDED = new Set(['react', 'react-dom'])

if (!existsSync(join(REGISTRY_DIR, 'registry.json'))) {
  console.error(
    `${REGISTRY_DIR}/registry.json is missing. Run: npm run registry:build`,
  )
  process.exit(1)
}

const index = JSON.parse(
  readFileSync(join(REGISTRY_DIR, 'registry.json'), 'utf8'),
)
// v8 first, then v9: each group installs its own @tanstack/react-table major once
const items = [
  ...index.items.filter((i) => !i.name.endsWith('-v9')),
  ...index.items.filter((i) => i.name.endsWith('-v9')),
].filter((i) => !only || only.has(i.name))

if (items.length === 0) {
  console.error('No registry items matched.')
  process.exit(1)
}

const MIME = { '.json': 'application/json' }
const server = createServer((req, res) => {
  const file = join(REGISTRY_DIR, decodeURIComponent(req.url.split('?')[0]))
  if (
    !file.startsWith(REGISTRY_DIR) ||
    !existsSync(file) ||
    !statSync(file).isFile()
  ) {
    res.writeHead(404).end()
    return
  }
  res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'text/plain' })
  createReadStream(file).pipe(res)
})
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const base = `http://127.0.0.1:${server.address().port}`

const root = mkdtempSync(join(tmpdir(), 'registry-check-'))
mkdirSync(join(root, 'src/lib'), { recursive: true })
writeFileSync(
  join(root, 'package.json'),
  JSON.stringify(
    {
      name: 'registry-consumer',
      private: true,
      type: 'module',
      dependencies: {
        react: '^19.2.0',
        'react-dom': '^19.2.0',
        clsx: '^2.1.1',
        'tailwind-merge': '^3.0.2',
        'class-variance-authority': '^0.7.1',
        'lucide-react': '^0.577.0',
        tailwindcss: '^4.1.18',
        'tw-animate-css': '^1.3.6',
      },
      devDependencies: {
        typescript: '^5.9.0',
        '@types/react': '^19.2.0',
        '@types/react-dom': '^19.2.0',
        '@types/node': '^22.10.2',
      },
    },
    null,
    2,
  ),
)
writeFileSync(
  join(root, 'tsconfig.json'),
  JSON.stringify({
    compilerOptions: {
      target: 'ES2022',
      jsx: 'react-jsx',
      module: 'ESNext',
      moduleResolution: 'bundler',
      lib: ['ES2022', 'DOM', 'DOM.Iterable'],
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      baseUrl: '.',
      paths: { '@/*': ['./src/*'] },
    },
    include: ['src'],
  }),
)
writeFileSync(
  join(root, 'components.json'),
  JSON.stringify({
    $schema: 'https://ui.shadcn.com/schema.json',
    style: 'new-york',
    rsc: false,
    tsx: true,
    tailwind: {
      config: '',
      css: 'src/index.css',
      baseColor: 'zinc',
      cssVariables: true,
      prefix: '',
    },
    aliases: {
      components: '@/components',
      utils: '@/lib/utils',
      ui: '@/components/ui',
      lib: '@/lib',
      hooks: '@/hooks',
    },
    iconLibrary: 'lucide',
  }),
)
writeFileSync(join(root, 'src/index.css'), '@import "tailwindcss";\n')
writeFileSync(
  join(root, 'src/lib/utils.ts'),
  `import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`,
)

// Async on purpose: the registry is served from this very process, so a
// blocking spawn would starve the server the shadcn CLI is fetching from
function run(command, commandArgs) {
  return new Promise((resolve) => {
    const child = spawn(command, commandArgs, {
      cwd: root,
      shell: process.platform === 'win32',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let output = ''
    child.stdout.on('data', (chunk) => (output += chunk))
    child.stderr.on('data', (chunk) => (output += chunk))
    child.on('error', (error) => resolve({ ok: false, output: String(error) }))
    child.on('close', (code) =>
      resolve({ ok: code === 0, output: output.trim() }),
    )
  })
}

console.log(`Consumer project: ${root}`)
const installed = await run('npm', ['install', '--no-audit', '--no-fund'])
if (!installed.ok) {
  console.error(installed.output)
  process.exit(1)
}

function findFile(dir, name) {
  if (!existsSync(dir)) return false
  return readdirSync(dir, { withFileTypes: true }).some((entry) =>
    entry.isDirectory()
      ? findFile(join(dir, entry.name), name)
      : entry.name === name,
  )
}

const packageName = (specifier) =>
  specifier.startsWith('@')
    ? specifier.split('/').slice(0, 2).join('/')
    : specifier.split('/')[0]

// Bare package imports in the files an item itself ships (not shadcn/ui's)
function undeclaredImports(item, registryItem) {
  const declared = new Set(
    (item.dependencies ?? []).map((d) =>
      packageName(d.replace(/@[^@/]+$/, '')),
    ),
  )
  const missing = new Set()
  for (const file of registryItem.files) {
    const specifiers = file.content.matchAll(
      /(?:from|import)\s+['"]([^'"]+)['"]/g,
    )
    for (const [, specifier] of specifiers) {
      if (/^(\.|#|@\/|@components)/.test(specifier)) continue
      const name = packageName(specifier)
      if (!PROVIDED.has(name) && !declared.has(name)) missing.add(name)
    }
  }
  return [...missing]
}

const results = []
for (const item of items) {
  const started = Date.now()
  const problems = []
  rmSync(join(root, 'src/components'), { recursive: true, force: true })
  rmSync(join(root, 'src/routes'), { recursive: true, force: true })

  const registryItem = JSON.parse(
    readFileSync(join(REGISTRY_DIR, `${item.name}.json`), 'utf8'),
  )

  const add = await run('npx', [
    '--yes',
    'shadcn@latest',
    'add',
    `${base}/${item.name}.json`,
    '--yes',
    '--overwrite',
  ])
  if (!add.ok) {
    problems.push(`shadcn add failed:\n${add.output}`)
  } else {
    for (const file of registryItem.files) {
      const name = file.target.split('/').pop()
      if (!findFile(join(root, 'src'), name)) {
        problems.push(`file did not land: ${file.target}`)
      }
    }
    const missing = undeclaredImports(item, registryItem)
    if (missing.length) {
      problems.push(
        `imports not listed in "dependencies": ${missing.join(', ')}`,
      )
    }
    if (!SKIP_TYPECHECK.has(item.name)) {
      const tsc = await run('npx', ['tsc', '--noEmit', '-p', 'tsconfig.json'])
      if (!tsc.ok)
        problems.push(
          `type errors:\n${tsc.output.split('\n').slice(0, 12).join('\n')}`,
        )
    }
  }

  const seconds = ((Date.now() - started) / 1000).toFixed(0)
  results.push({ name: item.name, problems })
  console.log(`${problems.length ? '✘' : '✔'} ${item.name} (${seconds}s)`)
  for (const problem of problems)
    console.log(`    ${problem.replaceAll('\n', '\n    ')}`)
}

server.close()
if (!keep) rmSync(root, { recursive: true, force: true })

const failed = results.filter((r) => r.problems.length)
const summary = `Registry install check: ${results.length - failed.length}/${results.length} items installed and compiled cleanly.`
console.log(`\n${summary}`)
if (process.env.GITHUB_STEP_SUMMARY) {
  const lines = [`### ${summary}`, '']
  for (const r of failed)
    lines.push(`- **${r.name}**\n\n\`\`\`\n${r.problems.join('\n')}\n\`\`\``)
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${lines.join('\n')}\n`)
}
process.exit(failed.length ? 1 : 0)
