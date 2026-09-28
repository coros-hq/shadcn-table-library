import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import columnsSource from './columns.tsx?raw'
import dataSource from './data.ts?raw'
import configSource from './export-config.ts?raw'
import dialogSource from './export-dialog.tsx?raw'
import tableSource from './data-table.tsx?raw'
import exportSource from './export.ts?raw'
import demoSource from './index.tsx?raw'
import { ExportConfigDemo } from './index'

const files = [
  { path: 'src/components/export-config/data-table.tsx', code: tableSource },
  {
    path: 'src/components/export-config/export-dialog.tsx',
    code: dialogSource,
  },
  { path: 'src/components/export-config/export-config.ts', code: configSource },
  { path: 'src/components/export-config/export.ts', code: exportSource },
  { path: 'src/components/export-config/columns.tsx', code: columnsSource },
  { path: 'src/components/export-config/data.ts', code: dataSource },
  { path: 'src/components/export-config/index.tsx', code: demoSource },
]

const steps = [
  {
    title: 'The export settings are one plain object',
    description:
      'Statuses, regions, date range, columns, and format all live in a single ExportConfig held by the table component. The dialog only edits it, so the settings survive closing and reopening the dialog, and Reset is just setting it back to defaultExportConfig().',
    file: 'src/components/export-config/export-config.ts',
    code: `export type ExportConfig = {
  statuses: Order['status'][]
  regions: Order['region'][]
  datePreset: DatePreset
  columns: string[]
  format: ExportFormat
}`,
  },
  {
    title: 'The live count and the file come from the same function',
    description:
      'applyExportConfig() is the only place that decides which rows are exported. The "N of 30 rows" line in the dialog and the downloaded file both call it, so the number the user sees is always the number they get.',
    file: 'src/components/export-config/data-table.tsx',
    code: `const matches = useMemo(
  () => applyExportConfig(data, config, today),
  [data, config, today],
)`,
  },
  {
    title: 'Column choices come from the table, not a second list',
    description:
      "The dialog's column checkboxes are built from table.getAllLeafColumns(), using each column's header as its label. Add a column to columns.tsx and it shows up in the export dialog automatically. Picked columns are kept in table order, whatever order they were ticked in.",
    file: 'src/components/export-config/data-table.tsx',
    code: `const exportColumns = table.getAllLeafColumns().map((column) => ({
  id: column.id,
  label: typeof column.columnDef.header === 'string'
    ? column.columnDef.header
    : column.id,
}))`,
  },
  {
    title: 'Exports use raw values, not what the cell displays',
    description:
      'The table renders amounts as "$129.50" and statuses as badges, but the file gets the underlying values (129.5, "Paid") so spreadsheets can sort and sum them. Export is disabled when nothing matches or no column is selected, so an empty file is never downloaded.',
    file: 'src/components/export-config/data-table.tsx',
    code: `const rows = matches.map((order) =>
  chosen.map((c) => String(order[c.id as keyof Order])),
)`,
  },
]

export function ExportConfigPage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-normal tracking-tight sm:text-4xl">
            Shadcn Table Export Configuration
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground text-balance">
            Export through a dialog instead of a one-click download: pick which
            statuses, regions, and dates to include, choose columns and format,
            and see how many rows match before anything downloads.
          </p>
        </div>

        <InstallCommand name="export-config-table" />

        <ComponentPreview preview={<ExportConfigDemo />} files={files} />

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
