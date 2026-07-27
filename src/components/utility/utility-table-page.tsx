import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import columnsSource from './columns.tsx?raw'
import exportSource from './export.ts?raw'
import tableSource from './data-table.tsx?raw'
import demoSource from './index.tsx?raw'
import { UtilityTableDemo } from './index'

const files = [
  { path: 'src/components/utility/columns.tsx', code: columnsSource },
  { path: 'src/components/utility/export.ts', code: exportSource },
  { path: 'src/components/utility/data-table.tsx', code: tableSource },
  { path: 'src/components/utility/index.tsx', code: demoSource },
]

const steps = [
  {
    title: 'Density is three predefined class maps, not a runtime calculation',
    description:
      "densityCell and densityHead are plain lookup objects keyed by 'compact' | 'comfortable' | 'spacious'. Switching density just picks a different precomputed set of Tailwind classes for every cell — no inline style math, no per-row measurement.",
    file: 'src/components/utility/data-table.tsx',
    code: `const densityCell: Record<Density, string> = {
  compact: 'py-1 text-xs',
  comfortable: 'py-2 text-sm',
  spacious: 'py-4 text-base',
}`,
  },
  {
    title: "Export reads whatever the table is currently showing, not a separate field list",
    description:
      "getExportData() pulls headers straight from table.getHeaderGroups()[0].headers and row values from table.getRowModel().rows[].getVisibleCells(). CSV and Excel export always match the columns actually rendered — hide a column later and export follows automatically, with no second copy of the field list to keep in sync.",
    file: 'src/components/utility/data-table.tsx',
    code: `function getExportData() {
  const headers = table.getHeaderGroups()[0].headers.map((header) =>
    typeof header.column.columnDef.header === 'string' ? header.column.columnDef.header : header.column.id,
  )
  const rows = table.getRowModel().rows.map((row) =>
    row.getVisibleCells().map((cell) => String(cell.getValue() ?? '')),
  )
  return { headers, rows }
}`,
  },
  {
    title: "Excel export is an HTML table with an .xls extension, not a real spreadsheet file",
    description:
      "toExcelHtml builds a plain <table> string, and downloadFile serves it with the application/vnd.ms-excel MIME type and a .xls filename. Excel (and Google Sheets) both recognize that combination and open it as a worksheet, so a real spreadsheet-writing library was never necessary for this example.",
    file: 'src/components/utility/export.ts',
    code: `export function toExcelHtml(headers: string[], rows: string[][]): string {
  const th = headers.map((h) => \`<th>\${h}</th>\`).join('')
  const trs = rows.map((row) => \`<tr>\${row.map((cell) => \`<td>\${cell}</td>\`).join('')}</tr>\`).join('')
  return \`<table><thead><tr>\${th}</tr></thead><tbody>\${trs}</tbody></table>\`
}`,
  },
  {
    title: "PDF export is just the browser's print dialog",
    description:
      "exportPdf calls window.print() directly — nothing else. \"Save as PDF\" is already a destination every modern browser offers in that dialog, so there's no PDF-generation code anywhere in this example, only the print: styling below that decides what the dialog actually shows.",
    file: 'src/components/utility/data-table.tsx',
    code: `function exportPdf() {
  window.print()
}`,
  },
  {
    title: "The print output ignores the app's theme entirely",
    description:
      "Every table element carries a print: variant forcing black text on a white background and black borders, regardless of whether the page is currently in dark mode — a printed page is always on white paper. The density/export toolbar itself is print:hidden, since neither control has any reason to appear on a printed page.",
    file: 'src/components/utility/data-table.tsx',
    code: `<div className="... print:hidden">{/* density + export controls */}</div>
<Table className="print:bg-white print:text-black">
  {/* every TableHead / TableCell also carries print:text-black */}
</Table>`,
  },
]

export function UtilityTablePage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Density &amp; Export
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            One table, three modes: a compact/comfortable/spacious density
            toggle, CSV/Excel/PDF export built from whatever the table is
            currently showing, and a print-optimized view that ignores dark
            mode entirely.
          </p>
        </div>

        <InstallCommand name="density-export-table" />

        <ComponentPreview preview={<UtilityTableDemo />} files={files} />

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
