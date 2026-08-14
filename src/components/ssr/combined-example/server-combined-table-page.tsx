import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import dataSource from '#/components/ssr/data.ts?raw'
import routeSource from '#/routes/server-combined-table.ts?raw'
import columnsSource from './columns.tsx?raw'
import tableSource from './data-table.tsx?raw'
import demoSource from './index.tsx?raw'
import { ServerCombinedDemo } from './index'

const files = [
  { path: 'src/components/ssr/data.ts', code: dataSource },
  { path: 'src/routes/server-combined-table.ts', code: routeSource },
  { path: 'src/components/ssr/combined-example/columns.tsx', code: columnsSource },
  { path: 'src/components/ssr/combined-example/data-table.tsx', code: tableSource },
  { path: 'src/components/ssr/combined-example/index.tsx', code: demoSource },
]

const steps = [
  {
    title: 'One server function resolves all three, in order',
    description:
      'getUsersPageCombined filters first, sorts the filtered set, then paginates the sorted set — in that order, every time. Sorting a filtered-down set (not the full table) and computing pageCount after both is what makes the three features honest about interacting with each other instead of pretending to be independent.',
    file: 'src/components/ssr/data.ts',
    code: `const filtered = Users.filter((u) => {
  if (data.role && u.role !== data.role) return false
  if (data.status && u.status !== data.status) return false
  return true
})

const sorted = data.sortBy
  ? [...filtered].sort((a, b) => { /* ... */ })
  : filtered

const start = data.page * data.pageSize
return {
  rows: sorted.slice(start, start + data.pageSize),
  pageCount: Math.ceil(sorted.length / data.pageSize),
}`,
  },
  {
    title: 'The URL holds all five params — nothing lives in local state',
    description:
      "validateSearch parses page, pageSize, role, status, sortBy, and sortDir straight from the URL, and loaderDeps/loader re-run getUsersPageCombined whenever any of them change. There's no separate client-side sorting or filtering state to keep in sync — the URL is the single source of truth for the whole table.",
    file: 'src/routes/server-combined-table.ts',
    code: `validateSearch: (search) => ({
  page: Number(search.page ?? 0),
  pageSize: Number(search.pageSize ?? 10),
  role: (search.role as string) ?? '',
  status: (search.status as string) ?? '',
  sortBy: (search.sortBy as string) ?? '',
  sortDir: (search.sortDir as string) === 'desc' ? 'desc' : 'asc',
}),
loaderDeps: ({ search }) => search,
loader: ({ deps }) => getUsersPageCombined({ data: deps }),`,
  },
  {
    title: 'manualPagination, manualSorting, and manualFiltering are all true',
    description:
      "Every getXRowModel that would slice, sort, or filter client-side is left out entirely — the table only ever renders the rows the server already resolved for this exact URL. Setting all three manual flags is what stops TanStack Table from silently re-sorting or re-filtering an already-correct server response.",
    file: 'src/components/ssr/combined-example/data-table.tsx',
    code: `const table = useReactTable({
  data: rows,
  columns,
  pageCount,
  manualPagination: true,
  manualSorting: true,
  manualFiltering: true,
  getCoreRowModel: getCoreRowModel(),
  // no getSortedRowModel, no getFilteredRowModel, no getPaginationRowModel
})`,
  },
  {
    title: 'Sorting state is derived from the URL, not useState',
    description:
      "sorting is computed fresh from sortBy/sortDir on every render instead of living in its own useState — that's what keeps it consistent with filtering and pagination, which already have to be URL-driven for SSR to work. onSortingChange still uses TanStack's own asc → desc → none cycling logic; it just translates the result into a navigate() call instead of a setState call.",
    file: 'src/components/ssr/combined-example/data-table.tsx',
    code: `const sorting: SortingState = sortBy
  ? [{ id: sortBy, desc: sortDir === 'desc' }]
  : []

onSortingChange: (updater) => {
  const next = typeof updater === 'function' ? updater(sorting) : updater
  const nextSort = next[0]
  navigate({
    search: (prev) => ({
      ...prev,
      sortBy: nextSort?.id ?? '',
      sortDir: nextSort?.desc ? 'desc' : 'asc',
      page: 0,
    }),
  })
}`,
  },
  {
    title: 'Every filter and sort change resets page to 0',
    description:
      "Changing the role filter, the status filter, or the sort column all navigate with page: 0 alongside whatever else changed — the result set size or order shifted, so staying on page 4 of a now-2-page result set would just show an empty table. Only page-to-page navigation itself leaves page alone.",
    file: 'src/components/ssr/combined-example/data-table.tsx',
    code: `navigate({
  search: (prev) => ({
    ...prev,
    role: val === 'all' ? '' : val,
    page: 0, // reset to page 0 — the result set size changed
  }),
})`,
  },
]

export function ServerCombinedTablePage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            SSR Sort + Filter + Pagination
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sorting, filtering, and pagination resolved together on the
            server, from the same URL, in a single request — the way real
            dashboards actually work, instead of three isolated demos that
            don't have to interact with each other.
          </p>
        </div>

        <InstallCommand name="server-combined-table" />

        <ComponentPreview preview={<ServerCombinedDemo />} files={files} />

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
