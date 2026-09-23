import { createFileRoute } from '@tanstack/react-router'
import { InventoryAllocationDemo } from '#/components/inventory-allocation'
import indexSource from '#/components/inventory-allocation/index.tsx?raw'
import columnsSource from '#/components/inventory-allocation/columns.tsx?raw'
import dataTableSource from '#/components/inventory-allocation/data-table.tsx?raw'
import formulasSource from '#/components/inventory-allocation/formulas.ts?raw'
import batchDetailSource from '#/components/inventory-allocation/batch-detail.tsx?raw'
import editableCellSource from '#/components/inventory-allocation/editable-cell.tsx?raw'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'

const files = [
  { path: 'src/components/inventory-allocation/index.tsx', code: indexSource },
  { path: 'src/components/inventory-allocation/columns.tsx', code: columnsSource },
  {
    path: 'src/components/inventory-allocation/data-table.tsx',
    code: dataTableSource,
  },
  { path: 'src/components/inventory-allocation/formulas.ts', code: formulasSource },
  {
    path: 'src/components/inventory-allocation/batch-detail.tsx',
    code: batchDetailSource,
  },
  {
    path: 'src/components/inventory-allocation/editable-cell.tsx',
    code: editableCellSource,
  },
]

const steps = [
  {
    title: 'Formulas are derived on read, never stored',
    description:
      "A row only holds raw inputs — batches, open order quantity, demand, lead time, safety stock. Available, reorder point, days of cover, and the suggested PO are all recomputed by deriveMetrics() from those inputs on every render. That's what makes editing safe: change one batch allocation and every dependent number (the SKU's status, its reorder quantity, the footer total) is correct on the next render, because there's no cached value anywhere to forget to update.",
    file: 'src/components/inventory-allocation/formulas.ts',
    code: `const reorderPoint = row.dailyDemand * row.leadTimeDays + row.safetyStock
const position = available - unallocated
const shortfall = Math.max(0, reorderPoint - position)
const reorderQty = Math.ceil(shortfall / row.casePack) * row.casePack`,
  },
  {
    title: 'Computed columns sort by the formula, not by what\'s on screen',
    description:
      "Each formula column uses accessorFn to hand TanStack the derived number, so sorting by Reorder point or Suggested PO works with no custom sortingFn. Status sorts by a severity rank (Short → Reorder → Healthy) rather than alphabetically, so the default sort puts the SKUs that need attention first.",
    file: 'src/components/inventory-allocation/columns.tsx',
    code: `{
  id: 'status',
  accessorFn: (row) => statusRank[deriveMetrics(row).status],
  cell: ({ row }) => <Badge>{deriveMetrics(row.original).status}</Badge>,
}`,
  },
  {
    title: 'Edits go through table meta, so columns stay static',
    description:
      "The Editable Table builds its columns inside useMemo because each cell closes over component state. Here the write-back functions are passed as the table's meta instead, and cells reach them with table.options.meta. The columns array is a plain module-level constant — it never gets rebuilt on each keystroke or save, and it can be read top to bottom like any other example's columns.tsx.",
    file: 'src/components/inventory-allocation/columns.tsx',
    code: `cell: ({ row, table }) => (
  <EditableNumberCell
    value={row.original[field]}
    onCommit={(n) => getMeta(table).updateSku(row.original.sku, field, n)}
  />
)`,
  },
  {
    title: "Expansion survives edits because it's keyed by SKU",
    description:
      "Unlike the Master-Detail Table's Set of ids, this uses TanStack's own expanded state with getRowCanExpand — batches are custom markup, not subRows. Two options make it survive editing: getRowId keys rows by SKU so an open panel follows its row when a re-sort moves it, and autoResetExpanded: false stops TanStack from collapsing every row whenever a save produces a new data array.",
    file: 'src/components/inventory-allocation/data-table.tsx',
    code: `getRowId: (row) => row.sku,
getRowCanExpand: () => true,
autoResetExpanded: false,`,
  },
  {
    title: 'Validation uses the whole row, not just the cell',
    description:
      "A batch's allocation is limited by two things: what that batch has on hand, and what's left of the SKU's open order after the other batches' allocations. The validator closes over the parent row to check both. An invalid value keeps the input open with the message beneath it instead of silently reverting, so the picker can fix the number in place.",
    file: 'src/components/inventory-allocation/batch-detail.tsx',
    code: `const allocatedElsewhere = allocated - batch.allocated

validate={(n) => {
  if (n > batch.onHand) return \`Only \${batch.onHand} on hand\`
  if (allocatedElsewhere + n > row.orderedQty) return \`Max \${row.orderedQty - allocatedElsewhere}\`
  return null
}}`,
  },
  {
    title: 'FEFO auto-allocation is just another formula',
    description:
      "First-expired, first-out picks from the batch that expires soonest and skips expired stock. allocateFefo() takes a row and returns new batches, so the Auto-allocate button is a single updateRow call — and because nothing derived is stored, the status, reorder quantity, and totals all follow automatically.",
    file: 'src/components/inventory-allocation/formulas.ts',
    code: `let remaining = row.orderedQty
for (const id of batchesByExpiry) {
  const take = Math.min(batch.onHand, remaining)
  allocations.set(id, take)
  remaining -= take
}`,
  },
]

export const Route = createFileRoute('/inventory-allocation-table')({
  head: () => ({
    meta: [
      { title: 'Inventory Allocation Table — ShadTable' },
      {
        name: 'description',
        content:
          'An editable inventory grid with expandable batch detail and live formula columns — reorder point, days of cover, and suggested PO recalculate as you edit demand, lead time, or batch allocations.',
      },
      {
        property: 'og:title',
        content: 'Inventory Allocation Table — ShadTable',
      },
      {
        property: 'og:description',
        content:
          'Editable grid + master-detail batch expansion + dynamic formula columns with FEFO auto-allocation, built on shadcn/ui and TanStack Table.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Inventory Allocation Table',
          description:
            'An editable inventory batch management and order allocation table with master-detail expansion and live formula columns.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
        },
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://www.shad-table.dev/inventory-allocation-table',
      },
    ],
  }),
  component: InventoryAllocationTablePage,
})

function InventoryAllocationTablePage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Inventory Allocation Table
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A fulfillment-center grid for SKU allocation: edit demand, lead
            time, and safety stock inline, expand a SKU to allocate its
            batches across warehouse locations, and watch reorder points,
            days of cover, and suggested purchase orders recalculate live.
          </p>
        </div>

        <InstallCommand name="inventory-allocation-table" />

        <ComponentPreview
          preview={<InventoryAllocationDemo />}
          files={files}
        />

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
