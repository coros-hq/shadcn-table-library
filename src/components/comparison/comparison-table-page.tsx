import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import comparisonSource from './comparison.ts?raw'
import dataSource from './data.ts?raw'
import tableSource from './data-table.tsx?raw'
import demoSource from './index.tsx?raw'
import { ComparisonTableDemo } from './index'

const files = [
  { path: 'src/components/comparison/comparison.ts', code: comparisonSource },
  { path: 'src/components/comparison/data.ts', code: dataSource },
  { path: 'src/components/comparison/data-table.tsx', code: tableSource },
  { path: 'src/components/comparison/index.tsx', code: demoSource },
]

const steps = [
  {
    title: 'Columns are generated per plan, not authored',
    description:
      "Same dynamic-column technique as the Pivot Table: plans.map(...) builds one ColumnDef per pricing plan inside a useMemo. Add a fourth plan to the data and a fourth column — header, price, CTA button, and every feature cell beneath it — appears with zero changes to the table component itself.",
    file: 'src/components/comparison/data-table.tsx',
    code: `const columns = useMemo<ColumnDef<Feature>[]>(
  () => [
    { id: 'feature', header: '', accessorKey: 'label', /* ... */ },
    ...plans.map((plan) => ({
      id: plan.id,
      header: plan.name,
      accessorFn: (feature) => feature.values[plan.id],
      cell: ({ getValue }) => <div className="text-center">{renderValue(getValue())}</div>,
    })),
  ],
  [plans],
)`,
  },
  {
    title: "It's an ordinary bordered table — only the header cell is richer",
    description:
      "Same overflow-hidden rounded-md border wrapper and default TableRow/TableCell borders as every other table in this library. The only thing that makes this read as a pricing table is that a plan's header cell renders a small card of its own — name, price, and a CTA Button — instead of a plain text label.",
    file: 'src/components/comparison/data-table.tsx',
    code: `<div className="overflow-hidden rounded-md border">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead />
        {plans.map((plan) => (
          <TableHead key={plan.id} className="py-4 align-bottom text-center">
            {/* plan name, price, and CTA Button */}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
    {/* ... */}
  </Table>
</div>`,
  },
  {
    title: "The highlighted plan is one boolean, applied per cell",
    description:
      "plan.highlighted just adds a bg-primary/5 tint to that column's header cell and every one of its body cells — no special borders, no rounding, nothing column-specific beyond that one background class. The tint alone is enough to draw the eye down the \"Pro\" column without breaking the table's normal grid.",
    file: 'src/components/comparison/data-table.tsx',
    code: `<TableCell
  key={cell.id}
  className={cn(plan?.highlighted && 'bg-primary/5')}
>`,
  },
  {
    title: 'Feature rows render differently by value type, from one function',
    description:
      "renderValue() checks typeof value === 'boolean' to decide between a Check/X icon or the raw string. The column definition itself doesn't know the difference — accessorFn just reads feature.values[plan.id] — so \"Team members\" can render \"Unlimited\" and \"Single sign-on\" can render a checkmark, both through the same cell renderer.",
    file: 'src/components/comparison/data-table.tsx',
    code: `function renderValue(value: FeatureValue) {
  if (typeof value === 'boolean') {
    return value ? <Check className="text-emerald-600" /> : <X className="text-muted-foreground/40" />
  }
  return value
}`,
  },
  {
    title: "The header cell's height comes from its own content, not the table",
    description:
      "A plan's header cell holds three stacked pieces — name, price, and a full-width Button — instead of one line of text, while the leading \"\" header cell next to it stays empty. align-bottom py-4 on every TableHead keeps that taller content flush with the row instead of vertically centering oddly against the empty cell beside it.",
    file: 'src/components/comparison/data-table.tsx',
    code: `<TableHead
  key={plan.id}
  className={cn('py-4 align-bottom text-center', plan.highlighted && 'bg-primary/5')}
>
  <div className="space-y-1">
    <p className="text-sm font-semibold">{plan.name}</p>
    <p className="text-2xl font-bold">{plan.price}<span className="text-sm font-normal text-muted-foreground">{plan.period}</span></p>
    <Button className="mt-2 w-full">{plan.cta}</Button>
  </div>
</TableHead>`,
  },
]

export function ComparisonTablePage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Comparison Table
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pricing plans as columns in an ordinary bordered table — feature
            rows compare booleans and values across every plan at once, with
            the recommended plan's column tinted to stand out.
          </p>
        </div>

        <InstallCommand name="comparison-table" />

        <ComponentPreview preview={<ComparisonTableDemo />} files={files} />

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
