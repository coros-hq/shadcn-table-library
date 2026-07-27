import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import columnsSource from './columns.tsx?raw'
import tableSource from './data-table.tsx?raw'
import detailSource from './order-detail.tsx?raw'
import demoSource from './index.tsx?raw'
import { MasterDetailDemo } from './index'

const files = [
  { path: 'src/components/master-detail/columns.tsx', code: columnsSource },
  { path: 'src/components/master-detail/data-table.tsx', code: tableSource },
  {
    path: 'src/components/master-detail/order-detail.tsx',
    code: detailSource,
  },
  { path: 'src/components/master-detail/index.tsx', code: demoSource },
]

const steps = [
  {
    title: "Expansion is a Set of ids, not TanStack's row-expansion feature",
    description:
      "The Tree Table and Grouped Table use getExpandedRowModel because their detail content is really more rows of the same shape (subRows). An order's detail panel isn't another row — it's arbitrary markup — so a plain useState<Set<string>> tracking which order ids are open is all that's needed, no row model feature required.",
    file: 'src/components/master-detail/data-table.tsx',
    code: `const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

function toggleRow(id: string) {
  setExpandedRows((prev) => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })
}`,
  },
  {
    title: 'The expander column is built inline, not imported statically',
    description:
      "Every other column comes from the static columns array in columns.tsx, same as the rest of this library. The expander column can't live there — its cell needs to read expandedRows and call toggleRow — so it's assembled with useMemo inside the table component and prepended to the imported columns each time expandedRows changes.",
    file: 'src/components/master-detail/data-table.tsx',
    code: `const allColumns = useMemo<ColumnDef<Order, any>[]>(
  () => [
    { id: 'expander', header: () => null, cell: ({ row }) => (/* toggle button */) },
    ...columns,
  ],
  [columns, expandedRows],
)`,
  },
  {
    title: 'The detail area is a second table row, not a special cell',
    description:
      "After each master TableRow, the body conditionally renders a second TableRow with one TableCell spanning colSpan={allColumns.length}. That keeps the header's column grid and every collapsed row's column grid identical — only the expanded row's markup breaks out of the per-column layout, and only for that one row.",
    file: 'src/components/master-detail/data-table.tsx',
    code: `<TableRow data-state={isExpanded ? 'expanded' : undefined}>
  {/* normal per-column cells */}
</TableRow>
{isExpanded ? (
  <TableRow>
    <TableCell colSpan={allColumns.length} className="bg-muted/30 p-4">
      <OrderDetail order={row.original} />
    </TableCell>
  </TableRow>
) : null}`,
  },
  {
    title: 'The detail panel can hold anything, including another table',
    description:
      "OrderDetail renders a small shipping-address panel next to a fully separate, nested <Table> of line items. A <table> nested inside a <td> is ordinary, valid HTML — unlike putting a non-table element directly inside <table> (the mistake that broke the Reorderable Table's DndContext earlier), nesting one table inside another table's cell is completely fine, so the same Table/TableHeader/TableBody components get reused one level down.",
    file: 'src/components/master-detail/order-detail.tsx',
    code: `<TableCell>{/* master row cells */}</TableCell>
{/* ...inside the expanded row's single cell: */}
<Table>
  <TableHeader>{/* Product / Qty / Price / Subtotal */}</TableHeader>
  <TableBody>{/* order.items.map(...) */}</TableBody>
</Table>`,
  },
  {
    title: "Collapsed orders never compute their detail content",
    description:
      "OrderDetail (and each line item's qty × price subtotal) only renders inside the isExpanded ? ... : null branch — for the three collapsed orders on the page, nothing about their items or shipping address is rendered or computed until the user actually asks to see it.",
    file: 'src/components/master-detail/data-table.tsx',
    code: `{isExpanded ? (
  <TableRow>{/* <OrderDetail order={row.original} /> */}</TableRow>
) : null}`,
  },
]

export function MasterDetailPage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Master-Detail Table
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Expand an order to reveal its shipping address and a nested
            sub-table of line items — a full-width detail row rendered
            directly beneath the row that owns it.
          </p>
        </div>

        <InstallCommand name="master-detail-table" />

        <ComponentPreview preview={<MasterDetailDemo />} files={files} />

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
