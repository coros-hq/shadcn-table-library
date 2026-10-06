import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, normalize } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  V9_PORTED_ROUTES,
  navGroups,
  topLevelLinks,
} from '#/components/docs/nav-content.tsx'

// Cheap, offline checks that the pieces of the site and the registry agree.
// The registry install check (`npm run registry:check`) does the same job
// against the real shadcn CLI; these catch most problems in milliseconds.

const read = (path: string) => readFileSync(path, 'utf8')
const SITE = 'https://www.shad-table.dev'

const links = [...topLevelLinks, ...navGroups.flatMap((group) => group.items)]

function routeFiles(dir: string) {
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => read(join(dir, entry.name)))
}
const v8Routes = routeFiles('src/routes').join('\n')
const v9Routes = routeFiles('src/routes/v9').join('\n')

describe('navigation, routes, sitemap and llms.txt', () => {
  it('has no duplicate nav links', () => {
    const paths = links.map((link) => link.to)
    expect(paths.filter((to, i) => paths.indexOf(to) !== i)).toEqual([])
  })

  it.each(links.map((link) => link.to))('%s has a route', (to) => {
    expect(v8Routes).toContain(`createFileRoute('${to}')`)
  })

  it.each([...V9_PORTED_ROUTES])('%s has a v9 route', (to) => {
    expect(v9Routes).toContain(`createFileRoute('/v9${to}')`)
  })

  it('lists only routes that exist in V9_PORTED_ROUTES', () => {
    const known = new Set(links.map((link) => link.to))
    expect([...V9_PORTED_ROUTES].filter((to) => !known.has(to))).toEqual([])
  })

  const sitemap = read('public/sitemap.xml')
  const llms = read('public/llms.txt')

  it.each(links.map((link) => link.to))('%s is in the sitemap', (to) => {
    expect(sitemap).toContain(`<loc>${SITE}${to}</loc>`)
  })

  it.each(links.map((link) => link.to))('%s is in llms.txt', (to) => {
    expect(llms).toContain(`](${SITE}${to})`)
  })
})

type RegistryFile = { path: string; target: string }
type RegistryItem = {
  name: string
  files: RegistryFile[]
  dependencies?: string[]
  registryDependencies?: string[]
}

// These ship a TanStack Start route that imports files by this repo's own
// paths (`#/routes/...`, `#/components/ssr/...`), and a shared data.ts that
// imports a sibling folder the install flattens away. They cannot work in a
// consumer project yet, so their import resolution is not asserted. Remove an
// entry as soon as it is fixed; the test below then starts guarding it.
const KNOWN_UNINSTALLABLE_IMPORTS = new Set([
  'server-pagination-table',
  'server-filter-table',
  'server-combined-table',
])

const registry = JSON.parse(read('registry.json')) as { items: RegistryItem[] }
const builtIndex = JSON.parse(read('public/r/registry.json')) as {
  items: Array<{ name: string }>
}

const stripExt = (path: string) => path.replace(/\.[^./]+$/, '')
const packageName = (specifier: string) =>
  specifier.startsWith('@')
    ? specifier.split('/').slice(0, 2).join('/')
    : specifier.split('/')[0]

describe('registry', () => {
  it('has unique item names', () => {
    const names = registry.items.map((item) => item.name)
    expect(names.filter((name, i) => names.indexOf(name) !== i)).toEqual([])
  })

  it('has a built v8 and v9 file for every item (run `npm run registry:build`)', () => {
    const built = new Set(builtIndex.items.map((item) => item.name))
    const missing = registry.items.flatMap((item) =>
      [item.name, `${item.name}-v9`].filter(
        (name) => !built.has(name) || !existsSync(`public/r/${name}.json`),
      ),
    )
    expect(missing).toEqual([])
  })

  describe.each(registry.items)('$name', (item) => {
    it('points at source files that exist', () => {
      expect(
        item.files.map((file) => file.path).filter((path) => !existsSync(path)),
      ).toEqual([])
    })

    it('pins the TanStack Table major its version needs', () => {
      // npm's `latest` for @tanstack/react-table is v9, so an unpinned
      // dependency would give v8 code the wrong major
      const table = item.dependencies?.find((dep) =>
        dep.startsWith('@tanstack/react-table'),
      )
      expect(table).toMatch(/^@tanstack\/react-table@\^8\./)
      const built = JSON.parse(read(`public/r/${item.name}-v9.json`)) as {
        dependencies?: string[]
      }
      expect(
        built.dependencies?.find((dep) =>
          dep.startsWith('@tanstack/react-table'),
        ),
      ).toMatch(/^@tanstack\/react-table@\^9\./)
    })

    for (const variant of [item.name, `${item.name}-v9`]) {
      it.skipIf(KNOWN_UNINSTALLABLE_IMPORTS.has(item.name))(
        `${variant}: installs self-contained and declares what it imports`,
        () => {
          const built = JSON.parse(read(`public/r/${variant}.json`)) as {
            dependencies?: string[]
            files: Array<{ target: string; content: string }>
          }
          const installed = new Set(
            built.files.map((file) => stripExt(normalize(file.target))),
          )
          const declared = new Set(
            (built.dependencies ?? []).map((dep) =>
              packageName(dep.replace(/@[^@/]+$/, '')),
            ),
          )

          const unresolved: string[] = []
          const undeclared = new Set<string>()
          const missingPrimitives = new Set<string>()
          for (const file of built.files) {
            for (const [, specifier] of file.content.matchAll(
              /(?:from|import)\s+['"]([^'"]+)['"]/g,
            )) {
              if (specifier.startsWith('.')) {
                const target = stripExt(
                  normalize(join(dirname(file.target), specifier)),
                )
                if (!installed.has(target)) {
                  unresolved.push(`${file.target} -> ${specifier}`)
                }
              } else if (specifier.startsWith('#')) {
                // The shadcn CLI rewrites these to the consumer's aliases, and
                // places registry:lib files under lib/ whatever their target says
                if (!/^#\/(components\/ui\/|lib\/)/.test(specifier)) {
                  unresolved.push(`${file.target} -> ${specifier}`)
                }
                const primitive = /^#\/components\/ui\/([a-z-]+)/.exec(
                  specifier,
                )?.[1]
                // ui/icons/* is shipped by the item itself, the rest comes from
                // the shadcn registry and must be requested
                if (
                  primitive &&
                  primitive !== 'icons' &&
                  !item.registryDependencies?.includes(primitive)
                ) {
                  missingPrimitives.add(primitive)
                }
              } else if (!/^(@\/|@components)/.test(specifier)) {
                const name = packageName(specifier)
                if (
                  name !== 'react' &&
                  name !== 'react-dom' &&
                  !declared.has(name)
                ) {
                  undeclared.add(name)
                }
              }
            }
          }
          expect(
            unresolved,
            'imports that will not resolve once installed',
          ).toEqual([])
          expect(
            [...undeclared],
            'packages missing from "dependencies"',
          ).toEqual([])
          expect(
            [...missingPrimitives],
            'shadcn/ui primitives missing from "registryDependencies"',
          ).toEqual([])
        },
      )
    }
  })
})
