import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import columnsSource from './columns.tsx?raw'
import dataSource from './data.ts?raw'
import tableSource from './data-table.tsx?raw'
import exportSource from './export.ts?raw'
import demoSource from './index.tsx?raw'
import { ExportSelectedDemo } from './index'

const files = [
  { path: 'src/components/export-selected/data-table.tsx', code: tableSource },
  { path: 'src/components/export-selected/columns.tsx', code: columnsSource },
  { path: 'src/components/export-selected/export.ts', code: exportSource },
  { path: 'src/components/export-selected/data.ts', code: dataSource },
  { path: 'src/components/export-selected/index.tsx', code: demoSource },
]

const steps = [
  {
    title: 'Selection is keyed by id, so it survives pagination',
    description:
      "By default TanStack keys selection by row index, so row 3 on page 1 and row 3 on page 2 would share a checkbox. getRowId makes the key the customer's id, so ticking rows on several pages builds one selection.",
    file: 'src/components/export-selected/data-table.tsx',
    code: `const table = useReactTable({
  data,
  columns,
  getRowId: (row) => row.id,
  state: { rowSelection },
  onRowSelectionChange: setRowSelection,
  // ...
})`,
  },
  {
    title: 'The header checkbox covers the page, "Select all" covers the table',
    description:
      'The header box uses toggleAllPageRowsSelected, so it only touches the rows the user can see, and shows a dash when some of them are selected. Once the whole page is ticked, a "Select all 25" link offers the rest, the same pattern Gmail uses.',
    file: 'src/components/export-selected/columns.tsx',
    code: `checked={
  table.getIsAllPageRowsSelected()
    ? true
    : table.getIsSomePageRowsSelected() ? 'indeterminate' : false
}
onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}`,
  },
  {
    title: 'Export reads the selected row model, not the visible rows',
    description:
      'getSelectedRowModel() returns every selected row across all pages, in table order. The select column is skipped, and values come from row.getValue() so the file gets 4200 rather than "$4,200".',
    file: 'src/components/export-selected/data-table.tsx',
    code: `const selectedRows = table.getSelectedRowModel().rows

const rows = selectedRows.map((row) =>
  exportColumns.map((column) => String(row.getValue(column.id) ?? '')),
)`,
  },
]

export function ExportSelectedPage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-normal tracking-tight sm:text-4xl">
            Export Selected Rows
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground text-balance">
            Tick the rows you need, across as many pages as you like, and export
            only those to CSV or Excel. The selection count and the export
            button stay in sync, and nothing downloads until something is
            selected.
          </p>
        </div>

        <InstallCommand name="export-selected-table" />

        <ComponentPreview preview={<ExportSelectedDemo />} files={files} />

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
