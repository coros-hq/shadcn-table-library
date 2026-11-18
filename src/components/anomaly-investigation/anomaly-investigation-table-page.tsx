import { useNavigate, useSearch } from '@tanstack/react-router'
import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import reactDataTsSource from './data.ts?raw'
import reactAnomaliesTsSource from './anomalies.ts?raw'
import reactHistoryChartTsxSource from './history-chart.tsx?raw'
import reactColumnsTsxSource from './columns.tsx?raw'
import reactDataTableTsxSource from './data-table.tsx?raw'
import reactIndexTsxSource from './index.tsx?raw'
import reactFinanceTsSource from './finance.ts?raw'
import reactFinanceDemoTsxSource from './finance-demo.tsx?raw'
import { AnomalyInvestigationDemo } from './index'
import { FinanceAnomalyDemo } from './finance-demo'
import vueAnomalyInvestigationDemoVueSource from '#/components/vue/anomaly-investigation/AnomalyInvestigationDemo.vue?raw'
import vueAnomalyTableVueSource from '#/components/vue/anomaly-investigation/AnomalyTable.vue?raw'
import vueColumnsTsSource from '#/components/vue/anomaly-investigation/columns.ts?raw'
import vueMetricDetailsVueSource from '#/components/vue/anomaly-investigation/MetricDetails.vue?raw'
import vueHistoryChartVueSource from '#/components/vue/anomaly-investigation/HistoryChart.vue?raw'
import vueRangeBarVueSource from '#/components/vue/anomaly-investigation/RangeBar.vue?raw'
import vueStylesTsSource from '#/components/vue/anomaly-investigation/styles.ts?raw'
import vueAnomaliesTsSource from '#/components/vue/anomaly-investigation/anomalies.ts?raw'
import vueDataTsSource from '#/components/vue/anomaly-investigation/data.ts?raw'
import vueFinanceTsSource from '#/components/vue/anomaly-investigation/finance.ts?raw'
import vueFinanceAnomalyDemoVueSource from '#/components/vue/anomaly-investigation/FinanceAnomalyDemo.vue?raw'
import svelteAnomalyInvestigationDemoSvelteSource from '#/components/svelte/anomaly-investigation/AnomalyInvestigationDemo.svelte?raw'
import svelteAnomalyTableSvelteSource from '#/components/svelte/anomaly-investigation/AnomalyTable.svelte?raw'
import svelteColumnsTsSource from '#/components/svelte/anomaly-investigation/columns.ts?raw'
import svelteMetricDetailsSvelteSource from '#/components/svelte/anomaly-investigation/MetricDetails.svelte?raw'
import svelteHistoryChartSvelteSource from '#/components/svelte/anomaly-investigation/HistoryChart.svelte?raw'
import svelteRangeBarSvelteSource from '#/components/svelte/anomaly-investigation/RangeBar.svelte?raw'
import svelteMetricCellSvelteSource from '#/components/svelte/anomaly-investigation/MetricCell.svelte?raw'
import svelteChangeCellSvelteSource from '#/components/svelte/anomaly-investigation/ChangeCell.svelte?raw'
import svelteFlagCellSvelteSource from '#/components/svelte/anomaly-investigation/FlagCell.svelte?raw'
import svelteReviewButtonSvelteSource from '#/components/svelte/anomaly-investigation/ReviewButton.svelte?raw'
import svelteExpandButtonSvelteSource from '#/components/svelte/anomaly-investigation/ExpandButton.svelte?raw'
import svelteTextCellSvelteSource from '#/components/svelte/anomaly-investigation/TextCell.svelte?raw'
import svelteStylesTsSource from '#/components/svelte/anomaly-investigation/styles.ts?raw'
import svelteAnomaliesTsSource from '#/components/svelte/anomaly-investigation/anomalies.ts?raw'
import svelteDataTsSource from '#/components/svelte/anomaly-investigation/data.ts?raw'
import svelteFinanceTsSource from '#/components/svelte/anomaly-investigation/finance.ts?raw'
import svelteFinanceAnomalyDemoSvelteSource from '#/components/svelte/anomaly-investigation/FinanceAnomalyDemo.svelte?raw'

interface Step {
  title: string
  description: string
  file: string
  code: string
}

const businessFiles = [
  {
    path: 'src/components/anomaly-investigation/data.ts',
    code: reactDataTsSource,
  },
  {
    path: 'src/components/anomaly-investigation/anomalies.ts',
    code: reactAnomaliesTsSource,
  },
  {
    path: 'src/components/anomaly-investigation/history-chart.tsx',
    code: reactHistoryChartTsxSource,
  },
  {
    path: 'src/components/anomaly-investigation/columns.tsx',
    code: reactColumnsTsxSource,
  },
  {
    path: 'src/components/anomaly-investigation/data-table.tsx',
    code: reactDataTableTsxSource,
  },
  {
    path: 'src/components/anomaly-investigation/index.tsx',
    code: reactIndexTsxSource,
  },
]

const financeFiles = [
  {
    path: 'src/components/anomaly-investigation/data.ts',
    code: reactDataTsSource,
  },
  {
    path: 'src/components/anomaly-investigation/finance.ts',
    code: reactFinanceTsSource,
  },
  {
    path: 'src/components/anomaly-investigation/anomalies.ts',
    code: reactAnomaliesTsSource,
  },
  {
    path: 'src/components/anomaly-investigation/history-chart.tsx',
    code: reactHistoryChartTsxSource,
  },
  {
    path: 'src/components/anomaly-investigation/columns.tsx',
    code: reactColumnsTsxSource,
  },
  {
    path: 'src/components/anomaly-investigation/data-table.tsx',
    code: reactDataTableTsxSource,
  },
  {
    path: 'src/components/anomaly-investigation/index.tsx',
    code: reactIndexTsxSource,
  },
  {
    path: 'src/components/anomaly-investigation/finance-demo.tsx',
    code: reactFinanceDemoTsxSource,
  },
]

const businessVueFiles = [
  {
    path: 'src/components/anomaly-investigation/AnomalyInvestigationDemo.vue',
    code: vueAnomalyInvestigationDemoVueSource,
  },
  {
    path: 'src/components/anomaly-investigation/AnomalyTable.vue',
    code: vueAnomalyTableVueSource,
  },
  {
    path: 'src/components/anomaly-investigation/columns.ts',
    code: vueColumnsTsSource,
  },
  {
    path: 'src/components/anomaly-investigation/MetricDetails.vue',
    code: vueMetricDetailsVueSource,
  },
  {
    path: 'src/components/anomaly-investigation/HistoryChart.vue',
    code: vueHistoryChartVueSource,
  },
  {
    path: 'src/components/anomaly-investigation/RangeBar.vue',
    code: vueRangeBarVueSource,
  },
  {
    path: 'src/components/anomaly-investigation/styles.ts',
    code: vueStylesTsSource,
  },
  {
    path: 'src/components/anomaly-investigation/anomalies.ts',
    code: vueAnomaliesTsSource,
  },
  {
    path: 'src/components/anomaly-investigation/data.ts',
    code: vueDataTsSource,
  },
]

const financeVueFiles = [
  {
    path: 'src/components/anomaly-investigation/FinanceAnomalyDemo.vue',
    code: vueFinanceAnomalyDemoVueSource,
  },
  {
    path: 'src/components/anomaly-investigation/finance.ts',
    code: vueFinanceTsSource,
  },
  {
    path: 'src/components/anomaly-investigation/AnomalyInvestigationDemo.vue',
    code: vueAnomalyInvestigationDemoVueSource,
  },
  {
    path: 'src/components/anomaly-investigation/AnomalyTable.vue',
    code: vueAnomalyTableVueSource,
  },
  {
    path: 'src/components/anomaly-investigation/columns.ts',
    code: vueColumnsTsSource,
  },
  {
    path: 'src/components/anomaly-investigation/MetricDetails.vue',
    code: vueMetricDetailsVueSource,
  },
  {
    path: 'src/components/anomaly-investigation/HistoryChart.vue',
    code: vueHistoryChartVueSource,
  },
  {
    path: 'src/components/anomaly-investigation/RangeBar.vue',
    code: vueRangeBarVueSource,
  },
  {
    path: 'src/components/anomaly-investigation/styles.ts',
    code: vueStylesTsSource,
  },
  {
    path: 'src/components/anomaly-investigation/anomalies.ts',
    code: vueAnomaliesTsSource,
  },
  {
    path: 'src/components/anomaly-investigation/data.ts',
    code: vueDataTsSource,
  },
]

const businessSvelteFiles = [
  {
    path: 'src/lib/components/anomaly-investigation/AnomalyInvestigationDemo.svelte',
    code: svelteAnomalyInvestigationDemoSvelteSource,
  },
  {
    path: 'src/lib/components/anomaly-investigation/AnomalyTable.svelte',
    code: svelteAnomalyTableSvelteSource,
  },
  {
    path: 'src/lib/components/anomaly-investigation/columns.ts',
    code: svelteColumnsTsSource,
  },
  {
    path: 'src/lib/components/anomaly-investigation/MetricDetails.svelte',
    code: svelteMetricDetailsSvelteSource,
  },
  {
    path: 'src/lib/components/anomaly-investigation/HistoryChart.svelte',
    code: svelteHistoryChartSvelteSource,
  },
  {
    path: 'src/lib/components/anomaly-investigation/RangeBar.svelte',
    code: svelteRangeBarSvelteSource,
  },
  {
    path: 'src/lib/components/anomaly-investigation/MetricCell.svelte',
    code: svelteMetricCellSvelteSource,
  },
  {
    path: 'src/lib/components/anomaly-investigation/ChangeCell.svelte',
    code: svelteChangeCellSvelteSource,
  },
  {
    path: 'src/lib/components/anomaly-investigation/FlagCell.svelte',
    code: svelteFlagCellSvelteSource,
  },
  {
    path: 'src/lib/components/anomaly-investigation/ReviewButton.svelte',
    code: svelteReviewButtonSvelteSource,
  },
  {
    path: 'src/lib/components/anomaly-investigation/ExpandButton.svelte',
    code: svelteExpandButtonSvelteSource,
  },
  {
    path: 'src/lib/components/anomaly-investigation/TextCell.svelte',
    code: svelteTextCellSvelteSource,
  },
  {
    path: 'src/lib/components/anomaly-investigation/styles.ts',
    code: svelteStylesTsSource,
  },
  {
    path: 'src/lib/components/anomaly-investigation/anomalies.ts',
    code: svelteAnomaliesTsSource,
  },
  {
    path: 'src/lib/components/anomaly-investigation/data.ts',
    code: svelteDataTsSource,
  },
]

const financeSvelteFiles = [
  {
    path: 'src/lib/components/anomaly-investigation/FinanceAnomalyDemo.svelte',
    code: svelteFinanceAnomalyDemoSvelteSource,
  },
  {
    path: 'src/lib/components/anomaly-investigation/finance.ts',
    code: svelteFinanceTsSource,
  },
  {
    path: 'src/lib/components/anomaly-investigation/AnomalyInvestigationDemo.svelte',
    code: svelteAnomalyInvestigationDemoSvelteSource,
  },
  {
    path: 'src/lib/components/anomaly-investigation/AnomalyTable.svelte',
    code: svelteAnomalyTableSvelteSource,
  },
  {
    path: 'src/lib/components/anomaly-investigation/columns.ts',
    code: svelteColumnsTsSource,
  },
  {
    path: 'src/lib/components/anomaly-investigation/MetricDetails.svelte',
    code: svelteMetricDetailsSvelteSource,
  },
  {
    path: 'src/lib/components/anomaly-investigation/HistoryChart.svelte',
    code: svelteHistoryChartSvelteSource,
  },
  {
    path: 'src/lib/components/anomaly-investigation/RangeBar.svelte',
    code: svelteRangeBarSvelteSource,
  },
  {
    path: 'src/lib/components/anomaly-investigation/MetricCell.svelte',
    code: svelteMetricCellSvelteSource,
  },
  {
    path: 'src/lib/components/anomaly-investigation/ChangeCell.svelte',
    code: svelteChangeCellSvelteSource,
  },
  {
    path: 'src/lib/components/anomaly-investigation/FlagCell.svelte',
    code: svelteFlagCellSvelteSource,
  },
  {
    path: 'src/lib/components/anomaly-investigation/ReviewButton.svelte',
    code: svelteReviewButtonSvelteSource,
  },
  {
    path: 'src/lib/components/anomaly-investigation/ExpandButton.svelte',
    code: svelteExpandButtonSvelteSource,
  },
  {
    path: 'src/lib/components/anomaly-investigation/TextCell.svelte',
    code: svelteTextCellSvelteSource,
  },
  {
    path: 'src/lib/components/anomaly-investigation/styles.ts',
    code: svelteStylesTsSource,
  },
  {
    path: 'src/lib/components/anomaly-investigation/anomalies.ts',
    code: svelteAnomaliesTsSource,
  },
  {
    path: 'src/lib/components/anomaly-investigation/data.ts',
    code: svelteDataTsSource,
  },
]

const vueDeps = {
  npm: ['@lucide/vue'],
  shadcn: ['badge', 'button', 'label', 'switch', 'table'],
  valueUpdater: true,
}

const svelteDeps = {
  npm: ['@lucide/svelte'],
  shadcn: ['badge', 'button', 'label', 'switch', 'table'],
  adapter: true,
}

const businessSteps: Step[] = [
  {
    title: 'Flagged by the expected range',
    description:
      'Each metric comes with the range its model expected for today. Above it is a spike, below it a drop. How far outside, measured in half-widths of the range, sets the severity and the default sort, so the most unusual change is at the top whatever its units.',
    file: 'src/components/anomaly-investigation/anomalies.ts',
    code: `export const kindOf = (p: Point): Kind =>
  p.actual > p.high ? 'spike' : p.actual < p.low ? 'drop' : 'normal'`,
  },
  {
    title: 'The range and the value side by side',
    description:
      'The Expected range column draws the range as a bar with a dot where today landed, stretched to fit both, so a value far outside is still on screen. Spikes are orange and drops violet, here and in the chart, and every flag also says Spike or Drop in words. Whether the move is good depends on the metric: a revenue spike is better than usual, a latency spike worse.',
    file: 'src/components/anomaly-investigation/anomalies.ts',
    code: `export const isGood = (m: Metric) =>
  (kindOf(m.today) === 'spike') === (m.better === 'up')`,
  },
  {
    title: 'Expand for the last two weeks',
    description:
      'A row expands to fourteen days and today: the expected range as a band, what happened as a line, and every day outside the band as a dot. Hovering shows a day’s value. Beside it are the 7-day average, the same day last week and earlier days outside the range, which tell a one-off from a pattern. A hidden table carries the same numbers for screen readers.',
    file: 'src/components/anomaly-investigation/history-chart.tsx',
    code: `<polygon points={band} className="fill-muted-foreground/12" />
<polyline points={line} className="stroke-foreground" strokeWidth={2} />`,
  },
  {
    title: 'Filter, review, move on',
    description:
      'Filter to spikes or drops, mark each anomaly reviewed as you go, and hide reviewed ones to work through a queue. When a reviewed row leaves the list, focus moves to the next row instead of getting lost.',
    file: 'src/components/anomaly-investigation/data-table.tsx',
    code: `const i = ids.indexOf(id)
focusNext.current = ids.at(i + 1) ?? ids.at(i - 1) ?? null`,
  },
]

const financeSteps: Step[] = [
  {
    title: 'Same table, money in and out',
    description:
      'The finance example uses every component of the business one unchanged and only swaps the data: twelve daily money flows in dollars, from cloud spend and chargebacks to invoices collected and the cash balance. Amounts of a thousand or more print in whole dollars and smaller ones with cents, so $1,240,000 and $380.00 sit side by side.',
    file: 'src/components/anomaly-investigation/finance.ts',
    code: `{ id: 'cloud-spend', name: 'Cloud hosting spend', unit: 'currency', better: 'down', … }`,
  },
  {
    title: 'Spending down is good, income down is not',
    description:
      'Each line says which way is good: costs like cloud spend, refunds and chargebacks are better when lower, income like invoices collected and subscription revenue better when higher. So a drop in ad spend reads as better than usual while a drop in invoices collected reads as worse, though both are flagged for a look.',
    file: 'src/components/anomaly-investigation/anomalies.ts',
    code: `export const isGood = (m: Metric) =>
  (kindOf(m.today) === 'spike') === (m.better === 'up')`,
  },
  {
    title: 'Bring your own numbers',
    description:
      'makeMetrics builds history and expected ranges from a short spec per line, and AnomalyInvestigationDemo takes the result as a prop. In your app, pass the daily totals from your ledger or payment provider along with the ranges your forecasting gives you.',
    file: 'src/components/anomaly-investigation/finance-demo.tsx',
    code: `export function FinanceAnomalyDemo() {
  return <AnomalyInvestigationDemo metrics={finance} />
}`,
  },
  ...businessSteps.slice(2),
]

const examples = [
  {
    value: 'business',
    title: 'Business metrics',
    description:
      'Revenue, latency, conversion and other product metrics. A spike or drop reads as better or worse depending on the metric: more revenue is good news, more latency is not.',
    install: 'anomaly-investigation-table',
    preview: <AnomalyInvestigationDemo />,
    files: businessFiles,
    vueFiles: businessVueFiles,
    svelteFiles: businessSvelteFiles,
    steps: businessSteps,
  },
  {
    value: 'finance',
    title: 'Finance',
    description:
      'A company’s money in and out, day by day: spend, refunds, chargebacks, fees, collections, revenue and cash. Every value is in dollars, and whether a spike is good news depends on the line: more revenue is, more chargebacks are not.',
    install: 'anomaly-investigation-finance-table',
    preview: <FinanceAnomalyDemo />,
    files: financeFiles,
    vueFiles: financeVueFiles,
    svelteFiles: financeSvelteFiles,
    steps: financeSteps,
  },
] as const

export type AnomalyExample = (typeof examples)[number]['value']

function HowItWorks({ steps }: { steps: readonly Step[] }) {
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium">How it works</h2>
      <div className="divide-y rounded-lg border">
        {steps.map((step, i) => (
          <div key={step.title} className="p-4">
            <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
              <span className="text-muted-foreground">{i + 1}.</span>
              {step.title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {step.description}
            </p>
            <CodeBlock filename={step.file} code={step.code} className="mt-3" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function AnomalyInvestigationTablePage() {
  const { example = 'business' } = useSearch({
    from: '/anomaly-investigation-table',
  })
  const navigate = useNavigate({ from: '/anomaly-investigation-table' })

  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-normal tracking-tight sm:text-4xl">
            Shadcn Anomaly Investigation Table
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground text-balance">
            Values against the ranges they were expected to stay in, with spikes
            and drops flagged. Expand any row for its last two weeks, and mark
            anomalies reviewed as you work through them. Pick an example.
          </p>
        </div>

        <Tabs
          value={example}
          onValueChange={(value) =>
            navigate({
              search: {
                example:
                  value === 'business' ? undefined : (value as AnomalyExample),
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
              <ComponentPreview
                preview={ex.preview}
                files={ex.files}
                vueFiles={ex.vueFiles}
                svelteFiles={ex.svelteFiles}
                svelteDeps={svelteDeps}
                vueDeps={vueDeps}
              />
              <HowItWorks steps={ex.steps} />
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </DocsLayout>
  )
}
