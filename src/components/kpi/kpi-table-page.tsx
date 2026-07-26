import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import kpiSource from './kpi.ts?raw'
import sparklineSource from './sparkline.tsx?raw'
import columnsSource from './columns.tsx?raw'
import tableSource from './data-table.tsx?raw'
import demoSource from './index.tsx?raw'
import { KpiTableDemo } from './index'

const files = [
  { path: 'src/components/kpi/kpi.ts', code: kpiSource },
  { path: 'src/components/kpi/sparkline.tsx', code: sparklineSource },
  { path: 'src/components/kpi/columns.tsx', code: columnsSource },
  { path: 'src/components/kpi/data-table.tsx', code: tableSource },
  { path: 'src/components/kpi/index.tsx', code: demoSource },
]

const steps = [
  {
    title: 'The sparkline is a hand-rolled SVG, not a charting library',
    description:
      "Sparkline normalizes a small array of numbers to a 0..height range and joins the points into a single <polyline points=\"...\">. For 8-12 points that's simpler and lighter than pulling in a charting dependency to draw what is, in the end, just one line.",
    file: 'src/components/kpi/sparkline.tsx',
    code: `const min = Math.min(...data)
const max = Math.max(...data)
const range = max - min || 1
const stepX = width / (data.length - 1)

const points = data
  .map((value, i) => {
    const x = i * stepX
    const y = height - ((value - min) / range) * height
    return \`\${x.toFixed(1)},\${y.toFixed(1)}\`
  })
  .join(' ')`,
  },
  {
    title: "Color comes from one number, reused twice",
    description:
      "change's sign drives both the TrendingUp/TrendingDown icon and color in the Change column, and the Sparkline's text-emerald/text-rose class in the Trend column. The badge and the sparkline can never disagree about whether a metric is trending up or down — they're colored by the exact same comparison, not two separate ones.",
    file: 'src/components/kpi/columns.tsx',
    code: `<Sparkline
  data={row.original.trend}
  className={cn(
    'h-7 w-24',
    row.original.change >= 0
      ? 'text-emerald-600 dark:text-emerald-500'
      : 'text-rose-600 dark:text-rose-500',
  )}
/>`,
  },
  {
    title: "The stroke color comes from currentColor, not a prop",
    description:
      "Sparkline's polyline sets stroke=\"currentColor\" and takes its actual color from a Tailwind text-color class on the wrapping element — the same trick lucide-react icons use elsewhere in this library. That's how light/dark mode work for the sparkline for free, without the component itself knowing anything about the app's theme.",
    file: 'src/components/kpi/sparkline.tsx',
    code: `<polyline
  points={points}
  fill="none"
  stroke="currentColor"
  strokeWidth={1.5}
  strokeLinecap="round"
  strokeLinejoin="round"
/>`,
  },
  {
    title: 'No sorting, filtering, or pagination — this is a dashboard widget',
    description:
      "With a small, fixed set of KPI rows meant to all be visible at once, getSortedRowModel/getFilteredRowModel/getPaginationRowModel would just be complexity a summary card never needs. getCoreRowModel is the entire row-model pipeline here.",
    file: 'src/components/kpi/data-table.tsx',
    code: `const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
})`,
  },
  {
    title: "Formatting is unit-aware, driven by each KPI's own unit field",
    description:
      "formatKpiValue branches on unit ('currency' | 'percent' | 'number'), so Revenue renders as $128,400, Churn Rate renders as 3.1%, and New Customers renders as a plain 482 — all from one shared formatting function instead of ad hoc .toFixed() calls scattered across column definitions.",
    file: 'src/components/kpi/kpi.ts',
    code: `export function formatKpiValue(value: number, unit: KpiUnit): string {
  if (unit === 'currency') {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
  }
  if (unit === 'percent') return \`\${value.toFixed(1)}%\`
  return value.toLocaleString('en-US')
}`,
  },
]

export function KpiTablePage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Summary / KPI Table
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A compact metrics table — current value, period-over-period
            change, and a per-row sparkline — for the kind of dashboard
            summary that sits above the fold.
          </p>
        </div>

        <InstallCommand name="kpi-table" />

        <ComponentPreview preview={<KpiTableDemo />} files={files} />

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
