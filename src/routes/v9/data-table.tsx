import { createFileRoute } from '@tanstack/react-router'

import { BasicTableUsage } from '#/components/v9/basic'
import basicIndexSource from '#/components/v9/basic/index.tsx?raw'
import basicDataTableSource from '#/components/v9/basic/data-table.tsx?raw'
import basicColumnsSource from '#/components/v9/basic/columns.tsx?raw'
import dataTableFilterSource from '#/components/v9/basic/data-table-filter.tsx?raw'
import tableV9FeaturesSource from '#/lib/table-v9-features.ts?raw'
import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'

export const Route = createFileRoute('/v9/data-table')({
  head: () => ({
    meta: [
      {
        title:
          'Shadcn Data Table — TanStack Table v9 Example — ShadTable',
      },
      {
        name: 'description',
        content:
          'A data table for shadcn/ui and TanStack Table v9. Same sortable, filterable, paginated table as the v8 version, ported to v9 useTable/tableFeatures.',
      },
      {
        property: 'og:title',
        content: 'Shadcn Data Table — TanStack Table v9 Example — ShadTable',
      },
      {
        property: 'og:description',
        content:
          'A sortable, filterable, paginated table built on shadcn/ui and TanStack Table v9.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Data Table (v9)',
          description:
            'A sortable, filterable, paginated table with a composable toolbar for column-specific filters, built on shadcn/ui and TanStack Table v9.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
        },
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://www.shad-table.dev/v9/data-table',
      },
    ],
  }),
  component: Home,
})

const files = [
  { path: 'src/lib/table-v9-features.ts', code: tableV9FeaturesSource },
  { path: 'src/components/v9/basic/index.tsx', code: basicIndexSource },
  { path: 'src/components/v9/basic/columns.tsx', code: basicColumnsSource },
  {
    path: 'src/components/v9/basic/data-table.tsx',
    code: basicDataTableSource,
  },
  {
    path: 'src/components/v9/basic/data-table-filter.tsx',
    code: dataTableFilterSource,
  },
]

const steps = [
  {
    title: 'Row models come from a shared `features` object, not table options',
    description:
      "In v8 each getXRowModel() was passed directly to useReactTable. In v9 they're feature slots registered once in tableFeatures() and reused across every table — features is a stable module-scope object, not recreated per render.",
    file: 'src/lib/table-v9-features.ts',
    code: `export const v9Features = tableFeatures({
  ...stockFeatures,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  // ...
  filterFns,
  sortFns,
  aggregationFns,
})`,
  },
  {
    title: '`useReactTable` becomes `useTable`, `features` is required',
    description:
      "The hook is renamed and now takes a features option built from tableFeatures(). getCoreRowModel is gone — the core row model is automatic.",
    file: 'src/components/v9/basic/data-table.tsx',
    code: `const table = useTable({
  features: v9Features,
  data,
  columns,
  onPaginationChange: setPagination,
  state: { pagination, sorting, globalFilter, columnFilters },
  onSortingChange: setSorting,
  onColumnFiltersChange: setColumnFilters,
  onGlobalFilterChange: setGlobalFilter,
})`,
  },
  {
    title: 'Columns are built with a features-aware column helper',
    description:
      'createColumnHelper now takes typeof features as its first type parameter so filterFn/sortFn string values are checked against the registries declared in features. sortingFn is renamed sortFn.',
    file: 'src/components/v9/basic/columns.tsx',
    code: `const columnHelper = createColumnHelper<typeof v9Features, User>()

export const columns = columnHelper.columns([
  columnHelper.accessor('role', {
    header: 'Role',
    sortFn: 'basic',
    filterFn: 'equalsString',
  }),
])`,
  },
  {
    title: '`flexRender` becomes `table.FlexRender`',
    description:
      "The standalone flexRender(def, context) call still exists, but v9's idiomatic form is the table.FlexRender component, bound to the table instance.",
    file: 'src/components/v9/basic/data-table.tsx',
    code: `{header.isPlaceholder ? null : <table.FlexRender header={header} />}
// ...
<table.FlexRender cell={cell} />`,
  },
  {
    title: '`table.getState()` becomes `table.state`',
    description:
      "State is a direct property instead of a method call. Per-slice state and onXChange callbacks work exactly like v8 — this table still owns pagination/sorting/filters as controlled React state.",
    file: 'src/components/v9/basic/data-table.tsx',
    code: `{table.state.columnFilters.length > 0 ? (
  <Button onClick={() => table.resetColumnFilters()}>Clear Filters</Button>
) : null}`,
  },
]

function Home() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-normal tracking-tight sm:text-4xl">
            Shadcn Data Table{' '}
            <span className="text-muted-foreground">— TanStack Table v9</span>
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground text-balance">
            The same sortable, filterable, paginated table as the v8 version,
            ported to TanStack Table v9's useTable and tableFeatures API.
            Behavior is unchanged — sorting, filtering, and pagination still
            run entirely in the browser.
          </p>
        </div>

        <InstallCommand name="data-table" />

        <ComponentPreview preview={<BasicTableUsage />} files={files} />

        <div className="space-y-2">
          <p className="text-sm font-medium">What changed from v8</p>
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
