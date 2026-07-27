import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import columnsSource from './columns.tsx?raw'
import tableSource from './data-table.tsx?raw'
import demoSource from './index.tsx?raw'
import { GroupedTableDemo } from './index'

const files = [
  { path: 'src/components/grouped/columns.tsx', code: columnsSource },
  { path: 'src/components/grouped/data-table.tsx', code: tableSource },
  { path: 'src/components/grouped/index.tsx', code: demoSource },
]

const steps = [
  {
    title: 'Groups come from a state array, not authored nesting',
    description:
      "Unlike the Tree Table (where children arrays are hand-authored data), grouping starts from a flat list of orders. grouping: ['category'] plus getGroupedRowModel() reshapes that flat list into group-header rows with their matching orders as subRows — the same subRows shape the Tree Table uses, just computed automatically from a column's values instead of written by hand.",
    file: 'src/components/grouped/data-table.tsx',
    code: `const [grouping, setGrouping] = useState<GroupingState>([groupBy])

const table = useReactTable({
  data,
  columns,
  getGroupedRowModel: getGroupedRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
  state: { grouping, expanded },
})`,
  },
  {
    title: 'Only one cell per group row renders the toggle',
    description:
      "cell.getIsGrouped() is true only for the single cell whose column is the active grouping column (Category) on a group-header row — that's the one cell with an expand/collapse button and the group's value. Every other cell in that same row is either aggregated or a blank placeholder, never a duplicate of the group value.",
    file: 'src/components/grouped/columns.tsx',
    code: `cell: ({ row, cell, getValue }) => {
  if (cell.getIsGrouped()) {
    return (
      <button onClick={row.getToggleExpandedHandler()}>
        <ChevronRight className={row.getIsExpanded() ? 'rotate-90' : ''} />
        {getValue()} ({row.subRows.length})
      </button>
    )
  }
  if (cell.getIsPlaceholder()) return null
  return <span className="pl-5">{getValue()}</span>
}`,
  },
  {
    title: 'Subtotals come from aggregationFn, not manual math',
    description:
      "The Amount column's aggregationFn: 'sum' runs automatically over every row in a group. getValue() returns a leaf order's own amount on a normal row, or the whole group's sum on a group-header row — from the exact same cell function, with no separate subtotal calculation to keep in sync.",
    file: 'src/components/grouped/columns.tsx',
    code: `{
  accessorKey: 'amount',
  header: 'Amount',
  aggregationFn: 'sum',
  cell: ({ cell, getValue }) => (
    <span className={cell.getIsAggregated() ? 'font-medium' : undefined}>
      {currency(getValue() as number)}
    </span>
  ),
}`,
  },
  {
    title: "Columns without an aggregationFn render blank on group rows",
    description:
      "cell.getIsAggregated() is true for any non-grouping column on a group row, whether or not that column defines an aggregationFn — Customer and Status don't sum or average sensibly, so their cell functions explicitly return null on aggregated cells instead of showing a meaningless default value.",
    file: 'src/components/grouped/columns.tsx',
    code: `cell: ({ cell, getValue }) =>
  cell.getIsAggregated() ? null : (getValue() as string),`,
  },
  {
    title: 'Expansion is the same mechanism as the Tree Table',
    description:
      "Group rows collapse and expand through the exact same expanded state and row.getToggleExpandedHandler() the Tree Table uses — grouping and tree nesting are two different ways of producing the same subRows shape, so the expand/collapse code is identical between them.",
    file: 'src/components/grouped/data-table.tsx',
    code: `const [expanded, setExpanded] = useState<ExpandedState>(true)
// same state shape and handler as src/components/tree/data-table.tsx`,
  },
]

export function GroupedTablePage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Grouped Table
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Orders grouped by category, with collapsible group headers and a
            live subtotal of each group's order amounts.
          </p>
        </div>

        <InstallCommand name="grouped-table" />

        <ComponentPreview preview={<GroupedTableDemo />} files={files} />

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
