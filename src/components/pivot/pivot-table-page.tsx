import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import pivotSource from './pivot.ts?raw'
import dataSource from './data.ts?raw'
import tableSource from './data-table.tsx?raw'
import demoSource from './index.tsx?raw'
import { PivotTableDemo } from './index'

const files = [
  { path: 'src/components/pivot/pivot.ts', code: pivotSource },
  { path: 'src/components/pivot/data.ts', code: dataSource },
  { path: 'src/components/pivot/data-table.tsx', code: tableSource },
  { path: 'src/components/pivot/index.tsx', code: demoSource },
]

const steps = [
  {
    title: "The reshape happens before the table ever sees it",
    description:
      "pivotData() takes flat sales records plus a rowKey, colKey, and aggFn, and returns plain { rowValue, cells, total } objects — no TanStack Table types involved. The table itself has no idea what a \"pivot\" is; by the time useReactTable sees the data, it's already a flat list of rows like any other table in this library.",
    file: 'src/components/pivot/pivot.ts',
    code: `export function pivotData(data, rowKey, colKey, aggFn) {
  const rowValues = Array.from(new Set(data.map((d) => String(d[rowKey])))).sort()
  const colValues = Array.from(new Set(data.map((d) => String(d[colKey])))).sort()

  const rows = rowValues.map((rowValue) => {
    const rowRecords = data.filter((d) => String(d[rowKey]) === rowValue)
    const cells = {}
    for (const colValue of colValues) {
      cells[colValue] = aggregate(rowRecords.filter((d) => String(d[colKey]) === colValue), aggFn)
    }
    return { rowValue, cells, total: aggregate(rowRecords, aggFn) }
  })
  // ...
}`,
  },
  {
    title: 'Columns are generated from the data, not authored',
    description:
      "colValues — the pivoted axis's unique values — drives a useMemo'd ColumnDef[]. Switch \"Columns\" from Quarter to Channel and the table goes from 4 pivoted columns to 2, entirely from what's actually in the data that render, with no static column list to keep in sync.",
    file: 'src/components/pivot/data-table.tsx',
    code: `const columns = useMemo<ColumnDef<PivotRow>[]>(
  () => [
    { id: 'rowValue', header: rowLabel, accessorKey: 'rowValue', /* ... */ },
    ...colValues.map((colValue) => ({
      id: colValue,
      header: colValue,
      accessorFn: (row) => row.cells[colValue],
      cell: ({ getValue }) => formatValue(getValue(), aggFn),
    })),
    { id: 'total', header: 'Total', accessorKey: 'total', /* ... */ },
  ],
  [colValues, rowLabel, aggFn],
)`,
  },
  {
    title: "Row and column pickers can't select the same dimension twice",
    description:
      "Each Select's option list filters out whatever the other picker currently holds — the Rows dropdown never offers whatever Columns is already set to, and vice versa. A meaningless Region-by-Region pivot is structurally impossible to select, rather than something validated (or silently broken) after the fact.",
    file: 'src/components/pivot/data-table.tsx',
    code: `<Select value={rowDim} onValueChange={(v) => setRowDim(v as keyof SalesRecord)}>
  <SelectContent>
    {DIMENSIONS.filter((d) => d.value !== colDim).map((d) => (
      <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
    ))}
  </SelectContent>
</Select>`,
  },
  {
    title: 'One aggregate function drives every number on the page',
    description:
      "aggregate() is the single function called for every cell, every column subtotal, and the grand total. Sum, average, and count all reuse it, so switching \"Aggregate\" from Sum to Average recomputes the whole table — including the totals row — with no separate subtotal formula that could drift out of sync with the body.",
    file: 'src/components/pivot/pivot.ts',
    code: `export function aggregate(records: SalesRecord[], aggFn: AggregationType): number {
  if (aggFn === 'count') return records.length
  if (records.length === 0) return 0
  const total = records.reduce((sum, r) => sum + r.amount, 0)
  return aggFn === 'avg' ? total / records.length : total
}`,
  },
  {
    title: "The grand-total row bypasses TanStack Table entirely",
    description:
      "columnTotals and grandTotal are rendered directly into a <TableFooter>, not through table.getRowModel() — it's a single row that doesn't sort, filter, or paginate like the others, so keeping it outside the table's own row model means it never has to fight those features if this example grows to include them later.",
    file: 'src/components/pivot/data-table.tsx',
    code: `<TableFooter>
  <TableRow>
    <TableCell>Total</TableCell>
    {colValues.map((colValue) => (
      <TableCell key={colValue}>{formatValue(columnTotals[colValue], aggFn)}</TableCell>
    ))}
    <TableCell>{formatValue(grandTotal, aggFn)}</TableCell>
  </TableRow>
</TableFooter>`,
  },
]

export function PivotTablePage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Pivot Table
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Dashboard-style analytics: pick which dimension becomes rows,
            which becomes columns, and how to aggregate (sum, average, or
            count) — the table and its totals recompute from the same flat
            sales data every time.
          </p>
        </div>

        <InstallCommand name="pivot-table" />

        <ComponentPreview preview={<PivotTableDemo />} files={files} />

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
