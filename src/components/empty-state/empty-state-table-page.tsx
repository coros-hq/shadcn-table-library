import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import dataSource from './data.ts?raw'
import emptyStateSource from './empty-state.tsx?raw'
import dataTableSource from './data-table.tsx?raw'
import indexSource from './index.tsx?raw'
import { EmptyStateTableDemo } from './index'
import vueEmptyStateTableDemoSource from '#/components/vue/empty-state/EmptyStateTableDemo.vue?raw'
import vueEmptyStateSource from '#/components/vue/empty-state/EmptyState.vue?raw'
import vueDataTableSource from '#/components/vue/empty-state/DataTable.vue?raw'
import vueColumnsSource from '#/components/vue/empty-state/columns.ts?raw'
import vueDataSource from '#/components/vue/empty-state/data.ts?raw'

const files = [
  { path: 'src/components/empty-state/data.ts', code: dataSource },
  {
    path: 'src/components/empty-state/empty-state.tsx',
    code: emptyStateSource,
  },
  { path: 'src/components/empty-state/data-table.tsx', code: dataTableSource },
  { path: 'src/components/empty-state/index.tsx', code: indexSource },
]

const vueFiles = [
  {
    path: 'src/components/empty-state/EmptyStateTableDemo.vue',
    code: vueEmptyStateTableDemoSource,
  },
  {
    path: 'src/components/empty-state/EmptyState.vue',
    code: vueEmptyStateSource,
  },
  {
    path: 'src/components/empty-state/DataTable.vue',
    code: vueDataTableSource,
  },
  { path: 'src/components/empty-state/columns.ts', code: vueColumnsSource },
  { path: 'src/components/empty-state/data.ts', code: vueDataSource },
]

const vueDeps = {
  npm: ['@lucide/vue'],
  shadcn: ['badge', 'button', 'input', 'table'],
  valueUpdater: true,
}

const steps = [
  {
    title: '"No data" and "no results" are different problems',
    description:
      'An empty list needs the user to create something; an empty search needs them to change the search. The table tells them apart by checking the source data length, not the filtered row count, and shows a different icon, message, and action for each.',
    file: 'src/components/empty-state/data-table.tsx',
    code: `const hasNoData = data.length === 0 // source is empty
const rows = table.getRowModel().rows // filtered result

{hasNoData ? <EmptyState title="No invoices yet" ... /> : <EmptyState title="No results found" ... />}`,
  },
  {
    title: 'The empty state lives inside the table body',
    description:
      'It renders in a single row with colSpan equal to the column count, so the header stays in place and the table keeps its borders and width. Collapsing to a standalone card makes the layout jump when data arrives.',
    file: 'src/components/empty-state/data-table.tsx',
    code: `<TableRow className="hover:bg-transparent">
  <TableCell colSpan={columns.length} className="p-0">
    {emptyState}
  </TableCell>
</TableRow>`,
  },
  {
    title: 'Every empty state has a next step',
    description:
      'EmptyState takes an optional action slot. First-use passes a Create button; no-results passes a Clear search button that resets the global filter. An empty state without an action is a dead end.',
    file: 'src/components/empty-state/empty-state.tsx',
    code: `interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}`,
  },
  {
    title: 'The search input is disabled when there is nothing to search',
    description:
      'With no data, filtering can\'t produce anything, so the input is disabled rather than inviting a search that can only lead to a misleading "no results" message.',
    file: 'src/components/empty-state/data-table.tsx',
    code: `<Input
  placeholder="Search invoices..."
  disabled={hasNoData}
/>`,
  },
]

export function EmptyStateTablePage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-normal tracking-tight sm:text-4xl">
            Shadcn Empty State Table
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground text-balance">
            Two different empty tables, handled separately: one with no data yet
            (with a call to action) and one where a search matches nothing (with
            a way to clear it).
          </p>
        </div>

        <InstallCommand name="empty-state-table" />

        <ComponentPreview
          preview={<EmptyStateTableDemo />}
          files={files}
          vueFiles={vueFiles}
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
