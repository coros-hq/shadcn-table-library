import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import dataSource from './data.ts?raw'
import errorStateSource from './error-state.tsx?raw'
import dataTableSource from './data-table.tsx?raw'
import indexSource from './index.tsx?raw'
import { ErrorStateTableDemo } from './index'
import vueErrorStateTableDemoSource from '#/components/vue/error-state/ErrorStateTableDemo.vue?raw'
import vueErrorStateSource from '#/components/vue/error-state/ErrorState.vue?raw'
import vueDataTableSource from '#/components/vue/error-state/DataTable.vue?raw'
import vueColumnsSource from '#/components/vue/error-state/columns.ts?raw'
import vueDataSource from '#/components/vue/error-state/data.ts?raw'
import svelteErrorStateTableDemoSource from '#/components/svelte/error-state/ErrorStateTableDemo.svelte?raw'
import svelteErrorStateSource from '#/components/svelte/error-state/ErrorState.svelte?raw'
import svelteDataTableSource from '#/components/svelte/error-state/DataTable.svelte?raw'
import svelteColumnsSource from '#/components/svelte/error-state/columns.ts?raw'
import svelteDataSource from '#/components/svelte/error-state/data.ts?raw'
import svelteAmountcellSource from '#/components/svelte/error-state/AmountCell.svelte?raw'
import svelteCustomercellSource from '#/components/svelte/error-state/CustomerCell.svelte?raw'
import svelteStatusbadgeSource from '#/components/svelte/error-state/StatusBadge.svelte?raw'

const files = [
  { path: 'src/components/error-state/data.ts', code: dataSource },
  {
    path: 'src/components/error-state/error-state.tsx',
    code: errorStateSource,
  },
  { path: 'src/components/error-state/data-table.tsx', code: dataTableSource },
  { path: 'src/components/error-state/index.tsx', code: indexSource },
]

const vueFiles = [
  {
    path: 'src/components/error-state/ErrorStateTableDemo.vue',
    code: vueErrorStateTableDemoSource,
  },
  {
    path: 'src/components/error-state/ErrorState.vue',
    code: vueErrorStateSource,
  },
  {
    path: 'src/components/error-state/DataTable.vue',
    code: vueDataTableSource,
  },
  { path: 'src/components/error-state/columns.ts', code: vueColumnsSource },
  { path: 'src/components/error-state/data.ts', code: vueDataSource },
]

const vueDeps = {
  npm: ['@lucide/vue'],
  shadcn: ['badge', 'button', 'table'],
}

const svelteFiles = [
  {
    path: 'src/lib/components/error-state/ErrorStateTableDemo.svelte',
    code: svelteErrorStateTableDemoSource,
  },
  {
    path: 'src/lib/components/error-state/ErrorState.svelte',
    code: svelteErrorStateSource,
  },
  {
    path: 'src/lib/components/error-state/DataTable.svelte',
    code: svelteDataTableSource,
  },
  {
    path: 'src/lib/components/error-state/columns.ts',
    code: svelteColumnsSource,
  },
  {
    path: 'src/lib/components/error-state/data.ts',
    code: svelteDataSource,
  },
  {
    path: 'src/lib/components/error-state/AmountCell.svelte',
    code: svelteAmountcellSource,
  },
  {
    path: 'src/lib/components/error-state/CustomerCell.svelte',
    code: svelteCustomercellSource,
  },
  {
    path: 'src/lib/components/error-state/StatusBadge.svelte',
    code: svelteStatusbadgeSource,
  },
]

const svelteDeps = {
  npm: ['@lucide/svelte'],
  shadcn: ['badge', 'button', 'table'],
  adapter: true,
}

const steps = [
  {
    title: 'The error shape depends on whether data exists',
    description:
      "If rows are already on screen, a failed refresh shouldn't wipe them: the table keeps the stale rows and shows a banner above. If there is nothing to show, the error takes the place of the table body. One hasStaleData check picks between them.",
    file: 'src/components/error-state/data-table.tsx',
    code: `const hasStaleData = rows.length > 0

{error && hasStaleData && <ErrorState variant="banner" ... />}
// ...no rows:
{error ? <ErrorState title="Something went wrong" ... /> : null}`,
  },
  {
    title: 'One component, two variants',
    description:
      'ErrorState renders a centered panel by default and a compact horizontal banner with variant="banner". They share the same retry button and wording props, so the message stays consistent wherever it appears.',
    file: 'src/components/error-state/error-state.tsx',
    code: `export function ErrorState({
  title, description, onRetry, isRetrying = false,
  variant = 'panel', // 'panel' | 'banner'
}: ErrorStateProps)`,
  },
  {
    title: 'Retry shows its own progress',
    description:
      'While a retry is in flight the button is disabled, its icon spins, and its label changes to "Retrying...". That prevents duplicate requests and tells the user something is happening.',
    file: 'src/components/error-state/error-state.tsx',
    code: `<Button variant="outline" size="sm" onClick={onRetry} disabled={isRetrying}>
  <RotateCw className={cn(isRetrying && 'animate-spin')} />
  {isRetrying ? 'Retrying...' : 'Try again'}
</Button>`,
  },
  {
    title: 'role="alert" announces the failure',
    description:
      'Both variants use role="alert", so screen readers announce the error when it appears instead of leaving the user waiting on a table that will never fill.',
    file: 'src/components/error-state/error-state.tsx',
    code: `<div role="alert" className="...">`,
  },
]

export function ErrorStateTablePage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-normal tracking-tight sm:text-4xl">
            Shadcn Error State Table
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground text-balance">
            A failed fetch shown two ways: a full error panel when there is
            nothing to display, and an inline banner above the last loaded rows
            when stale data is still useful. Both come with a retry action.
          </p>
        </div>

        <InstallCommand name="error-state-table" />

        <ComponentPreview
          preview={<ErrorStateTableDemo />}
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
