import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import dataSource from '#/components/ssr/data.ts?raw'
import routeSource from '#/routes/server-filter.ts?raw'
import tableSource from './data-table.tsx?raw'
import columnsSource from './columns.tsx?raw'
import demoSource from './index.tsx?raw'
import { ServerFilterDemo } from './index'

const files = [
  { path: 'src/components/ssr/data.ts', code: dataSource },
  { path: 'src/routes/server-filter.ts', code: routeSource },
  {
    path: 'src/components/ssr/filter-example/columns.tsx',
    code: columnsSource,
  },
  {
    path: 'src/components/ssr/filter-example/data-table.tsx',
    code: tableSource,
  },
  { path: 'src/components/ssr/filter-example/index.tsx', code: demoSource },
]

const steps = [
  {
    title: 'URL is the source of truth',
    description:
      "validateSearch parses page, pageSize, role and status straight off the query string, with defaults for each. Nothing about the current filter lives in React state — bookmarking or refreshing the URL reproduces the exact same view.",
    file: 'src/routes/server-filter.ts',
    code: `validateSearch: (search) => ({
  page: Number(search.page ?? 0),
  pageSize: Number(search.pageSize ?? 10),
  role: (search.role as string) ?? '',
  status: (search.status as string) ?? '',
}),`,
  },
  {
    title: 'Server function filters before slicing',
    description:
      'getUserPageWithFilter simulates a database query — it filters by role/status first, then slices out just the requested page and reports the total pageCount for the filtered set. It only ever runs on the server (createServerFn), with a simulated 400ms delay so the round-trip is visible.',
    file: 'src/components/ssr/data.ts',
    code: `export const getUserPageWithFilter = createServerFn({ method: 'GET' })
  .validator((input: { page: number; pageSize: number; role?: string; status?: string }) => input)
  .handler(async ({ data }) => {
    const filtered = Users.filter((u) => {
      if (data.role && u.role !== data.role) return false
      if (data.status && u.status !== data.status) return false
      return true
    })

    const start = data.page * data.pageSize
    return {
      rows: filtered.slice(start, start + data.pageSize),
      pageCount: Math.ceil(filtered.length / data.pageSize),
    }
  })`,
  },
  {
    title: 'Route loader resolves before the page renders',
    description:
      "loaderDeps forwards the parsed search params, and the route's loader calls getUserPageWithFilter({ data: deps }) before the page renders — so even a hard refresh with a filter already in the URL serves the correctly filtered page, with no client-side fetch.",
    file: 'src/routes/server-filter.ts',
    code: `loaderDeps: ({ search }) => search,
loader: ({ deps }) => getUserPageWithFilter({ data: deps }),`,
  },
  {
    title: 'The table only ever renders one page',
    description:
      "The table is only ever handed the current page's already-filtered rows via Route.useLoaderData(), with manualPagination: true so it doesn't re-slice them. There's no getFilteredRowModel or columnFilters state at all — filtering never happens client-side.",
    file: 'src/components/ssr/filter-example/data-table.tsx',
    code: `const { page, pageSize, role } = Route.useSearch()
const { rows, pageCount } = Route.useLoaderData()

const table = useReactTable({
  data: rows,
  columns,
  pageCount,
  manualPagination: true,
  // ...
})`,
  },
  {
    title: 'Changing a filter navigates, not setState',
    description:
      "The Role Select's onValueChange calls navigate to update the URL's role (resetting page back to 0, since the filtered result set size changed). That re-runs the loader and fetches the new page — watch the table dim briefly, that's the real network round-trip.",
    file: 'src/components/ssr/filter-example/data-table.tsx',
    code: `<Select
  value={role || 'all'}
  onValueChange={(val) =>
    navigate({
      search: (prev) => ({
        ...prev,
        role: val === 'all' ? '' : val,
        page: 0, // reset — the filtered result set size changed
      }),
    })
  }
>`,
  },
]

export function ServerFilterPage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">SSR Filter</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Filtering by column, resolved on the server the same way SSR
            Pagination resolves pages.
          </p>
        </div>

        <InstallCommand name="server-filter-table" />

        <ComponentPreview preview={<ServerFilterDemo />} files={files} />

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
