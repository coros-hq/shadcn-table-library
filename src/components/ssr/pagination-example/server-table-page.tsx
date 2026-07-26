import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
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

const steps = [
  {
    title: 'URL is the source of truth',
    description:
      "validateSearch parses page and pageSize straight off the query string, with defaults for each. Nothing about the current page lives in React state — bookmarking or refreshing the URL reproduces the exact same view.",
    file: 'src/routes/server-table.ts',
    code: `validateSearch: (search) => ({
  page: Number(search.page ?? 0),
  pageSize: Number(search.pageSize ?? 10),
}),`,
  },
  {
    title: 'Server function slices the page',
    description:
      'getUsersPage (in data.ts) simulates a database query — it slices out just the requested page and reports the total pageCount. It only ever runs on the server (createServerFn), with a simulated 400ms delay so the round-trip is visible.',
    file: 'src/components/ssr/data.ts',
    code: `export const getUsersPage = createServerFn({ method: 'GET' })
  .validator((input: { page: number; pageSize: number }) => input)
  .handler(async ({ data }) => {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const start = data.page * data.pageSize
    return {
      rows: Users.slice(start, start + data.pageSize),
      pageCount: Math.ceil(Users.length / data.pageSize),
    }
  })`,
  },
  {
    title: 'Route loader resolves before the page renders',
    description:
      "loaderDeps forwards the parsed search params, and the route's loader calls getUsersPage({ data: deps }) before the page renders — so even a hard refresh serves the correct page already rendered, with no client-side fetch.",
    file: 'src/routes/server-table.ts',
    code: `loaderDeps: ({ search }) => search,
loader: ({ deps }) => getUsersPage({ data: deps }),`,
  },
  {
    title: 'The table only ever renders one page',
    description:
      "The table is only ever handed the current page's rows via Route.useLoaderData(), with manualPagination: true telling TanStack Table not to slice the data itself — it just renders whatever page the server sent.",
    file: 'src/components/ssr/pagination-example/data-table.tsx',
    code: `const { page, pageSize } = Route.useSearch()
const { rows, pageCount } = Route.useLoaderData()

const table = useReactTable({
  data: rows,
  columns,
  pageCount,
  manualPagination: true,
  state: {
    pagination: { pageIndex: page, pageSize },
  },
})`,
  },
  {
    title: 'Changing pages navigates, not setState',
    description:
      "onPaginationChange navigates to update the URL's page/pageSize instead of writing to local state. That re-runs the loader and fetches the next page — watch the table dim briefly, that's the real network round-trip.",
    file: 'src/components/ssr/pagination-example/data-table.tsx',
    code: `onPaginationChange: (updater) => {
  const next =
    typeof updater === 'function'
      ? updater({ pageIndex: page, pageSize })
      : updater
  navigate({
    search: (prev) => ({
      ...prev,
      page: next.pageIndex,
      pageSize: next.pageSize,
    }),
  })
},`,
  },
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

        <InstallCommand name="server-pagination-table" />

        <ComponentPreview preview={<ServerPaginationDemo />} files={files} />

        <div className="space-y-2">
          <p className="text-sm font-medium">How it works</p>
          <div className="divide-y rounded-lg border">
            {steps.map((step, i) => (
              <div key={step.title} className="p-4">
                <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <span className="text-muted-foreground">{i + 1}.</span>
                  {step.title}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
                <CodeBlock
                  filename={step.file}
                  code={step.code}
                  className="mt-3"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </DocsLayout>
  )
}
