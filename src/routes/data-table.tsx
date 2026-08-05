import { createFileRoute } from '@tanstack/react-router'

import { BasicTableUsage } from '#/components/basic'
import basicIndexSource from '#/components/basic/index.tsx?raw'
import basicDataTableSource from '#/components/basic/data-table.tsx?raw'
import basicColumnsSource from '#/components/basic/columns.tsx?raw'
import dataTableFilterSource from '#/components/DataTableFilter.tsx?raw'
import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'

export const Route = createFileRoute('/data-table')({
  head: () => ({
    meta: [
      { title: 'Data Table — ShadTable' },
      {
        name: 'description',
        content:
          'A sortable, filterable, paginated table with a composable toolbar for column filters — filtering and sorting run entirely client-side via TanStack Table.',
      },
      { property: 'og:title', content: 'Data Table — ShadTable' },
      {
        property: 'og:description',
        content:
          'A sortable, filterable, paginated table with a composable toolbar for column-specific filters, built on shadcn/ui and TanStack Table.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Data Table',
          description:
            'A sortable, filterable, paginated table with a composable toolbar for column-specific filters, built on shadcn/ui and TanStack Table.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
        },
      },
    ],
    links: [
      { rel: 'canonical', href: 'https://shad-table.dev/data-table' },
    ],
  }),
  component: Home,
})

const files = [
  { path: 'src/components/basic/index.tsx', code: basicIndexSource },
  { path: 'src/components/basic/columns.tsx', code: basicColumnsSource },
  { path: 'src/components/basic/data-table.tsx', code: basicDataTableSource },
  { path: 'src/components/DataTableFilter.tsx', code: dataTableFilterSource },
]

const steps = [
  {
    title: 'The whole dataset lives on the client',
    description:
      "data is passed straight in as a prop — there's no server call. getFilteredRowModel, getSortedRowModel, and getPaginationRowModel all run in the browser against that full in-memory array.",
    file: 'src/components/basic/data-table.tsx',
    code: `const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  // ...
})`,
  },
  {
    title: 'Global search filters every column at once',
    description:
      "The search Input calls table.setGlobalFilter on every keystroke. TanStack Table matches that value against all columns' rendered text and getFilteredRowModel re-filters the in-memory rows — no debounce, no server round-trip.",
    file: 'src/components/basic/data-table.tsx',
    code: `<Input
  type="text"
  placeholder="Search..."
  onChange={(e) => table.setGlobalFilter(e.target.value)}
  className="filter-input w-64"
/>`,
  },
  {
    title: 'Per-column filters are just column.setFilterValue',
    description:
      "DataTableFilter is a thin Select wrapper around the column API — it reads column.getFilterValue() and writes back with column.setFilterValue(). BasicTableUsage composes one per filterable column through the table's filters render-prop.",
    file: 'src/components/DataTableFilter.tsx',
    code: `const filterValue = column?.getFilterValue() as string | undefined

<Select
  onValueChange={(val) => column?.setFilterValue(val)}
  value={filterValue}
>
  {/* ...options */}
</Select>`,
  },
  {
    title: 'Clicking a header sorts in place',
    description:
      "Each sortable TableHead wires its onClick to column.getToggleSortingHandler(). TanStack re-sorts the already-filtered rows via getSortedRowModel — sorting, filtering, and pagination all compose on the same in-memory row list.",
    file: 'src/components/basic/data-table.tsx',
    code: `<TableHead
  onClick={sortHandler}
  role={canSort ? 'button' : undefined}
  className={canSort ? 'cursor-pointer select-none' : undefined}
>
  {/* header content + sort icon */}
</TableHead>`,
  },
  {
    title: 'Page size is just table.setPageSize',
    description:
      "The page-size Select calls table.setPageSize directly, which recalculates pageIndex for you so the current scroll position stays sane. getPaginationRowModel then slices the filtered/sorted rows into pages, all without leaving the browser.",
    file: 'src/components/basic/data-table.tsx',
    code: `<Select
  value={pagination.pageSize.toString()}
  onValueChange={(val) => table.setPageSize(Number(val))}
>
  {/* ...page size options */}
</Select>`,
  },
]

function Home() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Data Table</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A sortable, filterable, paginated table with a composable toolbar
            for column-specific filters. Sorting, filtering, and pagination
            all happen entirely in the browser — the whole dataset is sent to
            the client once, and TanStack Table slices it locally.
          </p>
        </div>

        <InstallCommand name="data-table" />

        <ComponentPreview preview={<BasicTableUsage />} files={files} />

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
