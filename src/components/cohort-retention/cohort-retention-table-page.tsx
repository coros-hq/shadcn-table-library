import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import dataSource from './data.ts?raw'
import cohortsSource from './cohorts.ts?raw'
import columnsSource from './columns.tsx?raw'
import dataTableSource from './data-table.tsx?raw'
import indexSource from './index.tsx?raw'
import { CohortRetentionDemo } from './index'
import vueCohortRetentionDemoVueSource from '#/components/vue/cohort-retention/CohortRetentionDemo.vue?raw'
import vueCohortTableVueSource from '#/components/vue/cohort-retention/CohortTable.vue?raw'
import vueColumnsTsSource from '#/components/vue/cohort-retention/columns.ts?raw'
import vueRetentionCellVueSource from '#/components/vue/cohort-retention/RetentionCell.vue?raw'
import vueStylesTsSource from '#/components/vue/cohort-retention/styles.ts?raw'
import vueCohortsTsSource from '#/components/vue/cohort-retention/cohorts.ts?raw'
import vueDataTsSource from '#/components/vue/cohort-retention/data.ts?raw'
import svelteCohortRetentionDemoSvelteSource from '#/components/svelte/cohort-retention/CohortRetentionDemo.svelte?raw'
import svelteCohortTableSvelteSource from '#/components/svelte/cohort-retention/CohortTable.svelte?raw'
import svelteColumnsTsSource from '#/components/svelte/cohort-retention/columns.ts?raw'
import svelteRetentionCellSvelteSource from '#/components/svelte/cohort-retention/RetentionCell.svelte?raw'
import svelteCohortButtonSvelteSource from '#/components/svelte/cohort-retention/CohortButton.svelte?raw'
import svelteTextCellSvelteSource from '#/components/svelte/cohort-retention/TextCell.svelte?raw'
import svelteStylesTsSource from '#/components/svelte/cohort-retention/styles.ts?raw'
import svelteCohortsTsSource from '#/components/svelte/cohort-retention/cohorts.ts?raw'
import svelteDataTsSource from '#/components/svelte/cohort-retention/data.ts?raw'

const files = [
  { path: 'src/components/cohort-retention/data.ts', code: dataSource },
  { path: 'src/components/cohort-retention/cohorts.ts', code: cohortsSource },
  { path: 'src/components/cohort-retention/columns.tsx', code: columnsSource },
  {
    path: 'src/components/cohort-retention/data-table.tsx',
    code: dataTableSource,
  },
  { path: 'src/components/cohort-retention/index.tsx', code: indexSource },
]

const vueFiles = [
  {
    path: 'src/components/cohort-retention/CohortRetentionDemo.vue',
    code: vueCohortRetentionDemoVueSource,
  },
  {
    path: 'src/components/cohort-retention/CohortTable.vue',
    code: vueCohortTableVueSource,
  },
  {
    path: 'src/components/cohort-retention/columns.ts',
    code: vueColumnsTsSource,
  },
  {
    path: 'src/components/cohort-retention/RetentionCell.vue',
    code: vueRetentionCellVueSource,
  },
  {
    path: 'src/components/cohort-retention/styles.ts',
    code: vueStylesTsSource,
  },
  {
    path: 'src/components/cohort-retention/cohorts.ts',
    code: vueCohortsTsSource,
  },
  {
    path: 'src/components/cohort-retention/data.ts',
    code: vueDataTsSource,
  },
]

const vueDeps = {
  npm: ['@lucide/vue'],
  shadcn: ['button', 'table'],
  valueUpdater: false,
}

const svelteFiles = [
  {
    path: 'src/lib/components/cohort-retention/CohortRetentionDemo.svelte',
    code: svelteCohortRetentionDemoSvelteSource,
  },
  {
    path: 'src/lib/components/cohort-retention/CohortTable.svelte',
    code: svelteCohortTableSvelteSource,
  },
  {
    path: 'src/lib/components/cohort-retention/columns.ts',
    code: svelteColumnsTsSource,
  },
  {
    path: 'src/lib/components/cohort-retention/RetentionCell.svelte',
    code: svelteRetentionCellSvelteSource,
  },
  {
    path: 'src/lib/components/cohort-retention/CohortButton.svelte',
    code: svelteCohortButtonSvelteSource,
  },
  {
    path: 'src/lib/components/cohort-retention/TextCell.svelte',
    code: svelteTextCellSvelteSource,
  },
  {
    path: 'src/lib/components/cohort-retention/styles.ts',
    code: svelteStylesTsSource,
  },
  {
    path: 'src/lib/components/cohort-retention/cohorts.ts',
    code: svelteCohortsTsSource,
  },
  {
    path: 'src/lib/components/cohort-retention/data.ts',
    code: svelteDataTsSource,
  },
]

const svelteDeps = {
  npm: ['@lucide/svelte'],
  shadcn: ['button', 'table'],
  adapter: true,
}

const steps = [
  {
    title: 'Missing months are not zeros',
    description:
      'Each cohort keeps one number per month it has lived through, and the list simply stops where the cohort has not reached the month yet. Those cells are hatched and read "Not reached yet". A real zero, like the soft-launch cohort losing its last users, is an ordinary cell that says 0%, so the two never look alike.',
    file: 'src/components/cohort-retention/cohorts.ts',
    code: `if (period >= cohort.retained.length) return { kind: 'unavailable' }
return { kind: 'value', count, percent: (count / cohort.size) * 100 }`,
  },
  {
    title: 'One hue, scaled to where the data is',
    description:
      'Every cell is a shade of the same blue, mixed with the background by how many users stayed. Retention after the first month sits between 0 and about 50%, so the scale tops out at 60% to keep those differences visible. Text turns white on the strong cells, and every value is printed, so color is never the only way to read it.',
    file: 'src/components/cohort-retention/columns.tsx',
    code: `backgroundColor: \`color-mix(in oklab, var(--cohort) \${intensity(percent) * 100}%, transparent)\``,
  },
  {
    title: 'Counts or percentages',
    description:
      'The toggle switches every cell between users still active and the share of the cohort. The average row stays a percentage, weighted by cohort size and counting only cohorts that reached the month, because counts added across different cohorts mean nothing on their own. A month only one cohort has reached gets no average: one cohort is not an average, and a small one would make it swing.',
    file: 'src/components/cohort-retention/cohorts.ts',
    code: `const reached = list.filter((c) => period < c.retained.length)
if (reached.length < 2) return null
percent: (kept / users) * 100`,
  },
  {
    title: 'Highlight a cohort',
    description:
      'Clicking a cohort keeps its row at full strength and fades the others, and the line under the table compares it with the average at month three. Clicking it again, or the clear button, brings the table back.',
    file: 'src/components/cohort-retention/index.tsx',
    code: `toggle={(id) => setHighlighted((h) => (h === id ? null : id))}`,
  },
]

export function CohortRetentionTablePage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-normal tracking-tight text-balance sm:text-4xl">
            Shadcn Cohort Retention Table
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground text-balance">
            Users grouped by the month they signed up, and how many were still
            active each month after. Switch between counts and percentages,
            highlight a cohort, and tell months not reached yet from real zeros.
          </p>
        </div>

        <InstallCommand name="cohort-retention-table" />

        <ComponentPreview
          preview={<CohortRetentionDemo />}
          files={files}
          vueFiles={vueFiles}
          svelteFiles={svelteFiles}
          svelteDeps={svelteDeps}
          vueDeps={vueDeps}
        />

        <div className="space-y-4">
          <h2 className="text-xl font-medium tracking-tight">How it works</h2>
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
