import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import columnsSource from './columns.tsx?raw'
import tableSource from './data-table.tsx?raw'
import demoSource from './index.tsx?raw'
import { ToolbarFilterTableDemo } from './index'

const files = [
  { path: 'src/components/toolbar-filter/columns.tsx', code: columnsSource },
  { path: 'src/components/toolbar-filter/data-table.tsx', code: tableSource },
  { path: 'src/components/toolbar-filter/index.tsx', code: demoSource },
]

const steps = [
  {
    title: 'One search input, one filter per dropdown, no submit step',
    description:
      "The search box writes to globalFilter and each Select writes to its own column filter on every change event — there's no Apply button and no debounce. getFilteredRowModel() re-runs on each keystroke and re-render, which is the entry-point pattern most tables need before anything fancier is worth reaching for.",
    file: 'src/components/toolbar-filter/data-table.tsx',
    code: `const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  onColumnFiltersChange: setColumnFilters,
  onGlobalFilterChange: setGlobalFilter,
  state: { columnFilters, globalFilter },
})`,
  },
  {
    title: '"All" is undefined, not a sentinel string left in the filter state',
    description:
      "Radix Select can't represent an empty string as a value, so ToolbarSelect uses the literal 'all' for its placeholder item — but it converts that back to undefined before calling column.setFilterValue. An actual column filter is never set to the string 'all'; clearing a dropdown removes it from columnFilters entirely.",
    file: 'src/components/toolbar-filter/data-table.tsx',
    code: `const value = (column?.getFilterValue() as string | undefined) ?? 'all'

<Select
  value={value}
  onValueChange={(next) =>
    column?.setFilterValue(next === 'all' ? undefined : next)
  }
>`,
  },
  {
    title: 'Global search and column filters compose for free',
    description:
      'globalFilter (the search box) and columnFilters (the two Selects) are independent pieces of table state, but TanStack Table narrows the row model through both — typing in the search box while a Category filter is active searches only within that category, with no extra code to keep the two in sync.',
    file: 'src/components/toolbar-filter/data-table.tsx',
    code: `<Input
  placeholder="Search tasks..."
  value={globalFilter}
  onChange={(e) => table.setGlobalFilter(e.target.value)}
/>
<ToolbarSelect column={table.getColumn('category')} ... />
<ToolbarSelect column={table.getColumn('status')} ... />`,
  },
]

export function ToolbarFilterTablePage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Toolbar Filter Table
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A simple filter row above the table — dropdown selects and a search
            input, filters applied immediately. The 80% use case for filtering,
            and the default place to start.
          </p>
        </div>

        <InstallCommand name="toolbar-filter-table" />

        <ComponentPreview preview={<ToolbarFilterTableDemo />} files={files} />

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
