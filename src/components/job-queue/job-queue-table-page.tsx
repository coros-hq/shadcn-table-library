import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import dataSource from './data.ts?raw'
import queueSource from './queue.ts?raw'
import columnsSource from './columns.tsx?raw'
import jobErrorsSource from './job-errors.tsx?raw'
import dataTableSource from './data-table.tsx?raw'
import indexSource from './index.tsx?raw'
import { JobQueueDemo } from './index'
import vueJobQueueDemoVueSource from '#/components/vue/job-queue/JobQueueDemo.vue?raw'
import vueJobQueueTableVueSource from '#/components/vue/job-queue/JobQueueTable.vue?raw'
import vueColumnsTsSource from '#/components/vue/job-queue/columns.ts?raw'
import vueJobErrorsVueSource from '#/components/vue/job-queue/JobErrors.vue?raw'
import vueQueueTsSource from '#/components/vue/job-queue/queue.ts?raw'
import vueDataTsSource from '#/components/vue/job-queue/data.ts?raw'
import svelteJobQueueDemoSvelteSource from '#/components/svelte/job-queue/JobQueueDemo.svelte?raw'
import svelteJobQueueTableSvelteSource from '#/components/svelte/job-queue/JobQueueTable.svelte?raw'
import svelteColumnsTsSource from '#/components/svelte/job-queue/columns.ts?raw'
import svelteJobErrorsSvelteSource from '#/components/svelte/job-queue/JobErrors.svelte?raw'
import svelteStatusBadgeSvelteSource from '#/components/svelte/job-queue/StatusBadge.svelte?raw'
import svelteProgressCellSvelteSource from '#/components/svelte/job-queue/ProgressCell.svelte?raw'
import svelteJobCellSvelteSource from '#/components/svelte/job-queue/JobCell.svelte?raw'
import svelteNumberCellSvelteSource from '#/components/svelte/job-queue/NumberCell.svelte?raw'
import svelteRowActionsSvelteSource from '#/components/svelte/job-queue/RowActions.svelte?raw'
import svelteExpandButtonSvelteSource from '#/components/svelte/job-queue/ExpandButton.svelte?raw'
import svelteStatusTsSource from '#/components/svelte/job-queue/status.ts?raw'
import svelteQueueTsSource from '#/components/svelte/job-queue/queue.ts?raw'
import svelteDataTsSource from '#/components/svelte/job-queue/data.ts?raw'

const files = [
  { path: 'src/components/job-queue/data.ts', code: dataSource },
  { path: 'src/components/job-queue/queue.ts', code: queueSource },
  { path: 'src/components/job-queue/columns.tsx', code: columnsSource },
  { path: 'src/components/job-queue/job-errors.tsx', code: jobErrorsSource },
  { path: 'src/components/job-queue/data-table.tsx', code: dataTableSource },
  { path: 'src/components/job-queue/index.tsx', code: indexSource },
]

const vueFiles = [
  {
    path: 'src/components/job-queue/JobQueueDemo.vue',
    code: vueJobQueueDemoVueSource,
  },
  {
    path: 'src/components/job-queue/JobQueueTable.vue',
    code: vueJobQueueTableVueSource,
  },
  {
    path: 'src/components/job-queue/columns.ts',
    code: vueColumnsTsSource,
  },
  {
    path: 'src/components/job-queue/JobErrors.vue',
    code: vueJobErrorsVueSource,
  },
  {
    path: 'src/components/job-queue/queue.ts',
    code: vueQueueTsSource,
  },
  {
    path: 'src/components/job-queue/data.ts',
    code: vueDataTsSource,
  },
]

const vueDeps = {
  npm: ['@lucide/vue'],
  shadcn: ['badge', 'button', 'table'],
  valueUpdater: true,
}

const svelteFiles = [
  {
    path: 'src/lib/components/job-queue/JobQueueDemo.svelte',
    code: svelteJobQueueDemoSvelteSource,
  },
  {
    path: 'src/lib/components/job-queue/JobQueueTable.svelte',
    code: svelteJobQueueTableSvelteSource,
  },
  {
    path: 'src/lib/components/job-queue/columns.ts',
    code: svelteColumnsTsSource,
  },
  {
    path: 'src/lib/components/job-queue/JobErrors.svelte',
    code: svelteJobErrorsSvelteSource,
  },
  {
    path: 'src/lib/components/job-queue/StatusBadge.svelte',
    code: svelteStatusBadgeSvelteSource,
  },
  {
    path: 'src/lib/components/job-queue/ProgressCell.svelte',
    code: svelteProgressCellSvelteSource,
  },
  {
    path: 'src/lib/components/job-queue/JobCell.svelte',
    code: svelteJobCellSvelteSource,
  },
  {
    path: 'src/lib/components/job-queue/NumberCell.svelte',
    code: svelteNumberCellSvelteSource,
  },
  {
    path: 'src/lib/components/job-queue/RowActions.svelte',
    code: svelteRowActionsSvelteSource,
  },
  {
    path: 'src/lib/components/job-queue/ExpandButton.svelte',
    code: svelteExpandButtonSvelteSource,
  },
  {
    path: 'src/lib/components/job-queue/status.ts',
    code: svelteStatusTsSource,
  },
  {
    path: 'src/lib/components/job-queue/queue.ts',
    code: svelteQueueTsSource,
  },
  {
    path: 'src/lib/components/job-queue/data.ts',
    code: svelteDataTsSource,
  },
]

const svelteDeps = {
  npm: ['@lucide/svelte'],
  shadcn: ['badge', 'button', 'table'],
  adapter: true,
}

const steps = [
  {
    title: 'A job is its attempts',
    description:
      'Each job keeps a list of attempts with their start, end, how far they got and the error, if any. Status, the attempts count and the duration are all read from that list, and so is the error history in the expanded row. A real app fills it from whatever the workers report.',
    file: 'src/components/job-queue/data.ts',
    code: `interface Attempt {
  number: number
  startedAt: number
  endedAt?: number
  processed?: number
  error?: { code: string; message: string; trace: string[] }
}`,
  },
  {
    title: 'Failures retry on their own, with backoff',
    description:
      'A failed attempt puts the job in Retrying with a countdown (2s, then 4s, then 8s) until it runs out of attempts, and only then is it Failed. Retrying by hand puts it back in the queue with one more attempt allowed. At most two jobs run at once; the one that has waited longest starts next.',
    file: 'src/components/job-queue/queue.ts',
    code: `return attempt < job.maxAttempts
  ? { ...job, status: 'retrying', retryAt: now + backoff(attempt) }
  : { ...job, status: 'failed' }`,
  },
  {
    title: 'Rows with errors expand to their history',
    description:
      'getRowCanExpand allows expanding only rows that have a failed attempt, including jobs that later succeeded. The detail lists every attempt, newest first, with the error code, message and stack trace, so it is clear whether a retry is worth it.',
    file: 'src/components/job-queue/data-table.tsx',
    code: `getRowCanExpand: (row) => hasErrors(row.original),
autoResetExpanded: false,`,
  },
  {
    title: 'Live data without losing your place',
    description:
      'The queue updates five times a second, and TanStack resets expanded rows whenever the data changes unless told otherwise. getRowId keys rows by job id and autoResetExpanded: false keeps open rows open. The filter array is memoized so a tick does not count as a filter change.',
    file: 'src/components/job-queue/data-table.tsx',
    code: `getRowId: (job) => job.id,
autoResetExpanded: false,
autoResetPageIndex: false,`,
  },
  {
    title: 'One clock for the server and the browser',
    description:
      'Durations come from a demo clock that starts at 0 on both the server and the browser, so the first render matches and there is no hydration warning. In your app, pass the server time the data was read at as now, and tick it forward on the client.',
    file: 'src/components/job-queue/index.tsx',
    code: `const start = (): Queue => ({ now: 0, jobs: seedJobs() })
setQueue((q) => ({ now: q.now + TICK, jobs: tick(q.jobs, q.now + TICK, TICK) }))`,
  },
]

export function JobQueueTablePage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-normal tracking-tight sm:text-4xl">
            Shadcn Job Queue Table
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground text-balance">
            Background jobs as they run: progress, attempts and duration update
            live, failures retry on their own with backoff, and any job with
            errors expands to show what went wrong before you retry or cancel
            it.
          </p>
        </div>

        <InstallCommand name="job-queue-table" />

        <ComponentPreview
          preview={<JobQueueDemo />}
          files={files}
          vueFiles={vueFiles}
          svelteFiles={svelteFiles}
          svelteDeps={svelteDeps}
          vueDeps={vueDeps}
        />

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
