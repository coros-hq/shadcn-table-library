// Generates public/sitemap.xml and the v9 section of public/llms.txt from the
// route files, so a new page can't silently miss either one.
//
//   npm run seo:build
//
// <lastmod> is the date of the last commit that touched a page's route file or
// its component folder (today, if either has uncommitted changes). Google
// ignores lastmod values that turn out to be wrong, so it must be real.
import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const SITE = 'https://www.shad-table.dev'
const today = new Date().toISOString().slice(0, 10)

const git = (...args) => {
  try {
    return execFileSync('git', args, { encoding: 'utf8' }).trim()
  } catch {
    return ''
  }
}

function pages(dir) {
  return (
    readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && /\.tsx?$/.test(entry.name))
      .map((entry) => {
        const file = join(dir, entry.name)
        const source = readFileSync(file, 'utf8')
        const route = /createFileRoute\('([^']+)'\)/.exec(source)?.[1]
        const folder = /#\/components\/(?:v9\/)?([\w-]+)\//.exec(source)?.[1]
        // The first entry of the route's head meta, not a `title:` from page content
        const title = /meta:\s*\[\s*\{\s*title:\s*(['"])(.*?)\1/s.exec(
          source,
        )?.[2]
        const description =
          /name: 'description',\s*content:\s*(['"])(.*?)\1,?\s*\}/s.exec(
            source,
          )?.[2]
        return { file, route, folder, title, description }
      })
      // Redirect-only index routes and anything without a canonical page
      .filter((page) => page.route && page.route !== '/v9/' && page.title)
  )
}

function lastmod({ file, folder, route }) {
  const paths = [file]
  if (folder) {
    paths.push(`src/components/${folder}`)
    if (route.startsWith('/v9/')) paths.push(`src/components/v9/${folder}`)
  }
  if (git('status', '--porcelain', '--', ...paths)) return today
  return git('log', '-1', '--format=%cs', '--', ...paths) || today
}

const v8 = pages('src/routes')
const v9 = pages('src/routes/v9')

const entries = [
  ...v8.map((page) => ({ page, priority: page.route === '/' ? '1.0' : '0.8' })),
  ...v9.map((page) => ({ page, priority: '0.6' })),
]
  .map(({ page, priority }) => ({
    loc: `${SITE}${page.route === '/' ? '/' : page.route}`,
    lastmod: lastmod(page),
    priority,
  }))
  .sort((a, b) => a.loc.localeCompare(b.loc))

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`
writeFileSync('public/sitemap.xml', xml)
console.log(`sitemap.xml: ${entries.length} URLs`)

// llms.txt: keep the hand-written part, regenerate the v9 section
const START = '<!-- v9:start -->'
const END = '<!-- v9:end -->'
const section = [
  START,
  '## TanStack Table v9 versions',
  '',
  'Every example above is also available for @tanstack/react-table v9. Install it by adding `-v9` to the name, for example `npx shadcn add https://www.shad-table.dev/r/tree-table-v9.json`.',
  '',
  ...v9
    .sort((a, b) => a.route.localeCompare(b.route))
    .map((page) => {
      const name = page.title.replace(
        /( — TanStack Table v9( Example)?)? — ShadTable$/,
        '',
      )
      return `- [${name} (v9)](${SITE}${page.route}): ${page.description}`
    }),
  END,
].join('\n')

let llms = readFileSync('public/llms.txt', 'utf8').trimEnd()
const startAt = llms.indexOf(START)
if (startAt >= 0) {
  llms = llms.slice(0, startAt).trimEnd()
}
writeFileSync('public/llms.txt', `${llms}\n\n${section}\n`)
console.log(`llms.txt: ${v9.length} v9 pages`)
