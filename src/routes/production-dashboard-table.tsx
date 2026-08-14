import { createFileRoute } from '@tanstack/react-router'
import { ProductionDashboardTableDemo } from '#/components/production-dashboard'
import indexSource from '#/components/production-dashboard/index.tsx?raw'
import columnsSource from '#/components/production-dashboard/columns.tsx?raw'
import dataTableSource from '#/components/production-dashboard/data-table.tsx?raw'
import rulesSource from '#/components/production-dashboard/rules.ts?raw'
import progressBarSource from '#/components/production-dashboard/progress-bar.tsx?raw'
import sparklineSource from '#/components/production-dashboard/sparkline.tsx?raw'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'

const files = [
  { path: 'src/components/production-dashboard/index.tsx', code: indexSource },
  { path: 'src/components/production-dashboard/columns.tsx', code: columnsSource },
  {
    path: 'src/components/production-dashboard/data-table.tsx',
    code: dataTableSource,
  },
  { path: 'src/components/production-dashboard/rules.ts', code: rulesSource },
  {
    path: 'src/components/production-dashboard/progress-bar.tsx',
    code: progressBarSource,
  },
  {
    path: 'src/components/production-dashboard/sparkline.tsx',
    code: sparklineSource,
  },
]

const steps = [
  {
    title: 'Three primitives, not one new idea',
    description:
      'This example is deliberately a composition, not a new feature: the same matchRule engine from the Conditional Formatting Table, the same hand-rolled Sparkline from the Summary/KPI Table, and a small new ProgressBar are combined onto one realistic dataset. Nothing here needs to be understood in isolation if you\'ve already seen those two examples.',
    file: 'src/components/production-dashboard/columns.tsx',
    code: `import { ProgressBar } from './progress-bar'
import { Sparkline } from './sparkline'
import { matchRule } from './rules'`,
  },
  {
    title: 'Progress bars need a default color; text formatting doesn\'t',
    description:
      "The Conditional Formatting Table lets rule?.className be undefined for a healthy row — cn() just drops it and the cell renders unstyled. A progress bar can't do that; an unstyled bar still has to be some color. So every rule list here ends with a catch-all test: () => true, guaranteeing matchRule always returns something to color the bar with.",
    file: 'src/components/production-dashboard/columns.tsx',
    code: `const outputRules: FormatRule<ProductionLine>[] = [
  { test: (row) => row.outputToday / row.targetOutput < 0.8, className: 'bg-rose-500' },
  { test: (row) => row.outputToday / row.targetOutput < 1, className: 'bg-amber-500' },
  { test: () => true, className: 'bg-emerald-500' }, // catch-all — always matches
]`,
  },
  {
    title: 'The bar renders a percentage; the label renders the real numbers',
    description:
      "ProgressBar only ever sees a 0–100 value and clamps it — it has no idea what a 'line' or a 'target' is. The Output column computes that percentage itself and separately renders the actual output/target integers next to the bar, since over-target output (>100%) still needs to clamp visually but shouldn't lie about the real number.",
    file: 'src/components/production-dashboard/columns.tsx',
    code: `const pct = (row.original.outputToday / row.original.targetOutput) * 100
<span>{row.original.outputToday} / {row.original.targetOutput}</span>
<ProgressBar value={pct} barClassName={rule?.className} />`,
  },
  {
    title: 'A sparkline can be colored the same way a bar can',
    description:
      "Sparkline renders its polyline with stroke=\"currentColor\", so wrapping it in a <span className={rule?.className}> recolors the whole trend line through CSS inheritance — no prop threading into the SVG itself. The rule here compares the trend's last value to its first, so a declining line renders in the same rose-500 used for a low output bar.",
    file: 'src/components/production-dashboard/columns.tsx',
    code: `const trendRules: FormatRule<ProductionLine>[] = [
  { test: (row) => row.trend[row.trend.length - 1] < row.trend[0], className: 'text-rose-500' },
  { test: () => true, className: 'text-emerald-500' },
]

<span className={rule?.className}>
  <Sparkline data={row.original.trend} />
</span>`,
  },
]

export const Route = createFileRoute('/production-dashboard-table')({
  head: () => ({
    meta: [
      { title: 'Production Dashboard Table — ShadTable' },
      {
        name: 'description',
        content:
          'A production-line dashboard combining conditional formatting, progress bars, and sparklines on one realistic dataset — a composition of existing primitives, not a new feature.',
      },
      {
        property: 'og:title',
        content: 'Production Dashboard Table — ShadTable',
      },
      {
        property: 'og:description',
        content:
          'Status badges, output/utilization progress bars, and 7-day trend sparklines, all driven by the same rule engine, built on shadcn/ui and TanStack Table.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Production Dashboard Table',
          description:
            'A production-line dashboard table combining conditional formatting, progress bars, and sparklines.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
        },
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://shad-table.dev/production-dashboard-table',
      },
    ],
  }),
  component: ProductionDashboardTablePage,
})

function ProductionDashboardTablePage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Production Dashboard Table
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A production-line status table combining status badges,
            output/utilization progress bars, and 7-day trend sparklines —
            a composition of the Conditional Formatting and Summary/KPI
            examples on one realistic dataset, not a new feature on its
            own.
          </p>
        </div>

        <InstallCommand name="production-dashboard-table" />

        <ComponentPreview
          preview={<ProductionDashboardTableDemo />}
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
