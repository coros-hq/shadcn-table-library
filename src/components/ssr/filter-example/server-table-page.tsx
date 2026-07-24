import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import dataSource from '#/components/ssr/data.ts?raw'
import routeSource from '#/routes/server-table.ts?raw'
import tableSource from './data-table.tsx?raw'
import columnsSource from './columns.tsx?raw'
import demoSource from './index.tsx?raw'
import { ServerPaginationDemo } from './index'

const files = [
  { path: 'src/components/ssr/data.ts', code: dataSource },
  { path: 'src/routes/server-table.ts', code: routeSource },
  {
    path: 'src/components/ssr/pagination-example/columns.tsx',
    code: columnsSource,
  },
  {
    path: 'src/components/ssr/pagination-example/data-table.tsx',
    code: tableSource,
  },
  { path: 'src/components/ssr/pagination-example/index.tsx', code: demoSource },
]

export function ServerTablePage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            SSR Pagination
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Only the current page's rows are ever sent to the browser —
            changing pages triggers a real server request instead of slicing
            an in-memory array.
          </p>
        </div>

        <div className="rounded-lg border bg-muted/30 p-4 text-sm">
          <p className="font-medium">How it works</p>
          <ol className="mt-2 list-decimal space-y-2 pl-4 text-muted-foreground">
            <li>
              <span className="text-foreground">Server function.</span>{' '}
              <code className="font-mono text-xs">getUsersPage</code> (in{' '}
              <code className="font-mono text-xs">data.ts</code>) simulates a
              database query — it slices out just the requested page and
              reports the total <code className="font-mono text-xs">pageCount</code>.
              It only ever runs on the server, with a simulated 400ms delay so
              the round-trip is visible.
            </li>
            <li>
              <span className="text-foreground">Route loader.</span>{' '}
              <code className="font-mono text-xs">validateSearch</code> puts{' '}
              <code className="font-mono text-xs">page</code>/
              <code className="font-mono text-xs">pageSize</code> in the URL,
              and the route's <code className="font-mono text-xs">loader</code>{' '}
              calls <code className="font-mono text-xs">getUsersPage</code>{' '}
              before the page renders — so even a hard refresh serves the
              correct page already rendered, with no client-side fetch.
            </li>
            <li>
              <span className="text-foreground">Table wiring.</span>{' '}
              <code className="font-mono text-xs">manualPagination: true</code>{' '}
              tells TanStack Table not to slice the data itself.{' '}
              <code className="font-mono text-xs">onPaginationChange</code>{' '}
              navigates to update the URL's <code className="font-mono text-xs">page</code>/
              <code className="font-mono text-xs">pageSize</code>, which
              re-runs the loader and fetches the next page. Watch the table
              dim briefly on each page change — that's the real network
              round-trip.
            </li>
          </ol>
        </div>

        <ComponentPreview preview={<ServerPaginationDemo />} files={files} />
      </section>
    </DocsLayout>
  )
}
