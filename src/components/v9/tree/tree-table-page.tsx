import { useNavigate, useSearch } from '@tanstack/react-router'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import columnsSource from './columns.tsx?raw'
import tableSource from './data-table.tsx?raw'
import demoSource from './index.tsx?raw'
import { TreeTableDemo } from './index'
import variantsTableSource from './variants/data-table.tsx?raw'
import variantsColumnsSource from './variants/columns.tsx?raw'
import variantsActionsSource from './variants/product-actions.tsx?raw'
import variantsDataSource from './variants/data.ts?raw'
import variantsDemoSource from './variants/index.tsx?raw'
import { VariantsTableDemo } from './variants/index'
import detailTableSource from './detail/data-table.tsx?raw'
import detailColumnsSource from './detail/columns.tsx?raw'
import detailCardSource from './detail/shipment-card.tsx?raw'
import detailDataSource from './detail/data.ts?raw'
import detailDemoSource from './detail/index.tsx?raw'
import { DetailPanelTableDemo } from './detail/index'

const files = [
  { path: 'src/components/tree/columns.tsx', code: columnsSource },
  { path: 'src/components/tree/data-table.tsx', code: tableSource },
  { path: 'src/components/tree/index.tsx', code: demoSource },
]

const steps = [
  {
    title: 'Rows are nested, not flat',
    description:
      "Each node carries its own children array (department → team → employee). getSubRows tells TanStack Table how to find a row's children, so the whole hierarchy is built from one recursive data structure instead of a flat list plus a parentId lookup.",
    file: 'src/components/tree/data-table.tsx',
    code: `const table = useTable({
  features: v9Features,
  data,
  columns,
  getSubRows: (row) => row.children,
  // ...
})`,
  },
  {
    title: 'Depth drives indentation',
    description:
      'Every row TanStack produces carries a depth (0 for roots, 1 for their children, and so on). The Name cell reads row.depth directly into an inline padding-left — no manual recursion needed to indent nested rows.',
    file: 'src/components/tree/columns.tsx',
    code: `cell: ({ row }) => (
  <div
    className="flex items-center gap-1.5"
    style={{ paddingLeft: \`\${row.depth * 1.25}rem\` }}
  >
    {/* expand toggle + row.original.name */}
  </div>
)`,
  },
  {
    title: 'Expansion is just table state',
    description:
      'expanded is a normal piece of controlled state, the same shape as sorting or column filters elsewhere in this library. Each toggle button calls row.getToggleExpandedHandler() — clicking it flips that row in and out of expanded, and getExpandedRowModel recomputes which sub-rows are currently visible.',
    file: 'src/components/tree/columns.tsx',
    code: `<button
  type="button"
  onClick={row.getToggleExpandedHandler()}
  aria-label={row.getIsExpanded() ? 'Collapse row' : 'Expand row'}
>
  <ChevronRight className={row.getIsExpanded() ? 'rotate-90' : ''} />
</button>`,
  },
  {
    title: "Search keeps a matching row's ancestors visible",
    description:
      'filterFromLeafRows: true changes how getFilteredRowModel treats the tree: a branch survives filtering if any descendant matches, not just the row itself. Without it, searching "Ava" would hide the whole Engineering → Frontend branch because the department and team rows don\'t contain that text.',
    file: 'src/components/tree/data-table.tsx',
    code: `getFilteredRowModel: getFilteredRowModel(),
filterFromLeafRows: true,`,
  },
  {
    title: 'Pagination is left out on purpose',
    description:
      "TanStack's row model pipeline runs pagination after expansion, so slicing by row count would cut a parent's children off at a page boundary and split the tree mid-branch. This example only composes sorting, filtering, and expansion — add pagination only once you've decided how a split branch should behave.",
    file: 'src/components/tree/data-table.tsx',
    code: `// getPaginationRowModel intentionally omitted —
// it runs after getExpandedRowModel and would
// paginate expanded child rows, not just roots.`,
  },
]

const variantsFiles = [
  {
    path: 'src/components/tree/variants/data-table.tsx',
    code: variantsTableSource,
  },
  {
    path: 'src/components/tree/variants/columns.tsx',
    code: variantsColumnsSource,
  },
  {
    path: 'src/components/tree/variants/product-actions.tsx',
    code: variantsActionsSource,
  },
  { path: 'src/components/tree/variants/data.ts', code: variantsDataSource },
  { path: 'src/components/tree/variants/index.tsx', code: variantsDemoSource },
]

const detailFiles = [
  {
    path: 'src/components/tree/detail/data-table.tsx',
    code: detailTableSource,
  },
  { path: 'src/components/tree/detail/columns.tsx', code: detailColumnsSource },
  {
    path: 'src/components/tree/detail/shipment-card.tsx',
    code: detailCardSource,
  },
  { path: 'src/components/tree/detail/data.ts', code: detailDataSource },
  { path: 'src/components/tree/detail/index.tsx', code: detailDemoSource },
]

const variantsSteps = [
  {
    title: 'Variants are sub-rows that stay hidden until asked for',
    description:
      'Each product carries an optional variants array, and getSubRows points TanStack Table at it. Expansion starts empty, so only products show. The "Show variants" link in the SKU column calls row.getToggleExpandedHandler(), and getCanExpand() is only true for products that have variants, so the others show their SKU instead of a link.',
    file: 'src/components/tree/variants/columns.tsx',
    code: `row.getCanExpand() ? (
  <button
    type="button"
    onClick={row.getToggleExpandedHandler()}
    aria-expanded={row.getIsExpanded()}
  >
    {row.getIsExpanded() ? 'Hide' : 'Show'} variants ({row.original.variants?.length})
  </button>
) : (
  <span>{row.original.sku}</span>
)`,
  },
  {
    title: 'The bracket is drawn by the cells, not an overlay',
    description:
      'Each variant draws its own piece of the connector in the thumbnail cell: a rounded elbow into the row and, unless it is the last variant, a rule that continues down. Cells are position: relative so the pieces sit against the cell edges, and rows inside an open group drop their bottom border so the pieces join into one line. Because the connector belongs to the row, sorting or filtering the table can never leave it misaligned.',
    file: 'src/components/tree/variants/columns.tsx',
    code: `const siblings = row.getParentRow()?.subRows ?? []
const isLast = row.index === siblings.length - 1

<span className="absolute top-0 left-1/2 h-1/2 w-3 rounded-bl-lg border-b-2 border-l-2" />
{!isLast && (
  <span className="absolute top-1/2 bottom-0 left-1/2 border-l-2" />
)}`,
  },
  {
    title: 'Only products are selectable',
    description:
      'Ticking a product should not tick its variants, and the header checkbox should mean "all products". enableRowSelection limits selection to depth 0 and enableSubRowSelection turns off the cascade. The header checkbox is computed over selectable rows, so it reaches the checked state once every product is selected.',
    file: 'src/components/tree/variants/data-table.tsx',
    code: `enableRowSelection: (row) => row.depth === 0,
enableSubRowSelection: false,`,
  },
  {
    title: 'Row actions own their state',
    description:
      'The add and watch buttons live in a small ProductActions component with its own state instead of writing into the table. Cell renderers are rendered as components, so a toggle re-renders one cell rather than the whole table, and the same component drops into any column.',
    file: 'src/components/tree/variants/columns.tsx',
    code: `cell: ({ row }) =>
  row.depth === 0 ? <ProductActions name={row.original.name} /> : null`,
  },
]

const detailSteps = [
  {
    title: 'One child per parent, enforced by the type',
    description:
      'Every order has exactly one shipment, and the data type says so: children is a one-item tuple. getSubRows returns it for orders and nothing for shipments, and expansion starts open so each shipment is visible under its order.',
    file: 'src/components/tree/detail/data-table.tsx',
    code: `getSubRows: (row) => (row.kind === 'order' ? row.children : undefined),
getExpandedRowModel: getExpandedRowModel(),
state: { expanded },`,
  },
  {
    title: 'Only the child row opens the card',
    description:
      'Orders just expand; shipments are the interactive rows. Clicking a shipment, or pressing Enter or Space on it, opens the card. row.getParentRow() supplies the order it belongs to, so the card can say whose parcel it is without a lookup.',
    file: 'src/components/tree/detail/data-table.tsx',
    code: `function openShipment(row: Row<TreeRow>) {
  const shipment = row.original
  const order = row.getParentRow()?.original
  if (shipment.kind !== 'shipment' || order?.kind !== 'order') return
  setPanel({ shipment, order, open: true })
}`,
  },
  {
    title: 'The card is docked beside the table and pushes it aside',
    description:
      'The table and the card share one flex box. The card sits in a wrapper whose width animates from 0 to 22rem, so opening it takes room from the table instead of covering it, and the card inside keeps a fixed width so its content never reflows mid-slide. Details, Amount and Date are hidden while it is open because the card already shows them, the same trick the Logs side panel uses. On phones the card slides over the table instead.',
    file: 'src/components/tree/detail/shipment-card.tsx',
    code: `<div className={cn(
  'overflow-hidden transition-[transform,width] duration-300 sm:relative sm:shrink-0',
  open ? 'translate-x-0 sm:w-88' : 'translate-x-full sm:translate-x-0 sm:w-0',
)}>
  <aside inert={!open} className="absolute inset-y-0 right-0 w-full border-l sm:w-88">`,
  },
  {
    title: 'Closing keeps the content and returns focus',
    description:
      'The panel state holds the shipment and a separate open flag, so closing only flips the flag and the card keeps showing the same shipment while it slides out. A closed card is inert, so focus is handed back to the row that opened it, and Escape closes the card from the row or from inside it.',
    file: 'src/components/tree/detail/data-table.tsx',
    code: `function closePanel() {
  if (!panel) return
  setPanel({ ...panel, open: false })
  panel.trigger.focus()
}`,
  },
]

const examples = [
  {
    value: 'org' as const,
    title: 'Org chart',
    description:
      "A hierarchical table for nested data — departments, teams, and employees — with expand/collapse, sorting, and a search box that keeps a matching row's ancestors visible.",
    install: 'tree-table',
    preview: <TreeTableDemo />,
    files,
    steps,
  },
  {
    value: 'variants' as const,
    title: 'Product variants',
    description:
      'A product catalog where a "Show variants" link opens a bracketed group of variant rows under the product, with selectable products and row actions.',
    install: 'tree-table-variants',
    preview: <VariantsTableDemo />,
    files: variantsFiles,
    steps: variantsSteps,
  },
  {
    value: 'detail' as const,
    title: 'Detail card',
    description:
      'Orders with exactly one shipment each. Clicking the shipment slides a details card in beside the table, which makes room for it.',
    install: 'tree-table-detail-card',
    preview: <DetailPanelTableDemo />,
    files: detailFiles,
    steps: detailSteps,
  },
]

export function TreeTablePage() {
  const { example = 'org' } = useSearch({ from: '/v9/tree-table' })
  const navigate = useNavigate({ from: '/v9/tree-table' })

  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-normal tracking-tight sm:text-4xl">
            Shadcn Tree Table
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground text-balance">
            Nested rows for shadcn/ui and TanStack Table, in three layouts: an
            org chart with search, a product catalog with expandable variants,
            and orders whose child row opens a details card.
          </p>
        </div>

        <Tabs
          value={example}
          onValueChange={(value) =>
            navigate({
              search: {
                example:
                  value === 'org'
                    ? undefined
                    : (value as 'variants' | 'detail'),
              },
              replace: true,
              resetScroll: false,
            })
          }
          className="gap-6"
        >
          <TabsList className="h-auto w-full justify-start gap-4 rounded-none border-b bg-transparent p-0">
            {examples.map((ex) => (
              <TabsTrigger
                key={ex.value}
                value={ex.value}
                className="-mb-px flex-none rounded-none border-x-0 border-t-0 border-b-2 border-transparent px-0.5 pb-2 text-sm font-normal text-muted-foreground shadow-none hover:text-foreground data-[state=active]:border-b-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none dark:data-[state=active]:border-b-foreground dark:data-[state=active]:bg-transparent"
              >
                {ex.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {examples.map((ex) => (
            <TabsContent key={ex.value} value={ex.value} className="space-y-4">
              <p className="max-w-2xl text-sm text-muted-foreground">
                {ex.description}
              </p>
              <InstallCommand name={ex.install} />
              <ComponentPreview preview={ex.preview} files={ex.files} />
              <div className="space-y-2">
                <p className="text-sm font-medium">How it works</p>
                <div className="divide-y rounded-lg border">
                  {ex.steps.map((step, i) => (
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
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </DocsLayout>
  )
}
