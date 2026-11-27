import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import dataSource from './data.ts?raw'
import draftsSource from './drafts.ts?raw'
import pickersSource from './pickers.tsx?raw'
import columnsSource from './columns.tsx?raw'
import dataTableSource from './data-table.tsx?raw'
import indexSource from './index.tsx?raw'
import { DraftRowsDemo } from './index'
import vueDraftRowsDemoVueSource from '#/components/vue/draft-rows/DraftRowsDemo.vue?raw'
import vueDraftRowsTableVueSource from '#/components/vue/draft-rows/DraftRowsTable.vue?raw'
import vueDraftFieldVueSource from '#/components/vue/draft-rows/DraftField.vue?raw'
import vueColumnsTsSource from '#/components/vue/draft-rows/columns.ts?raw'
import vueTypesTsSource from '#/components/vue/draft-rows/types.ts?raw'
import vueDraftsTsSource from '#/components/vue/draft-rows/drafts.ts?raw'
import vueDataTsSource from '#/components/vue/draft-rows/data.ts?raw'
import svelteDraftRowsDemoSvelteSource from '#/components/svelte/draft-rows/DraftRowsDemo.svelte?raw'
import svelteDraftRowsTableSvelteSource from '#/components/svelte/draft-rows/DraftRowsTable.svelte?raw'
import svelteDraftFieldSvelteSource from '#/components/svelte/draft-rows/DraftField.svelte?raw'
import svelteDraftActionsSvelteSource from '#/components/svelte/draft-rows/DraftActions.svelte?raw'
import svelteTextCellSvelteSource from '#/components/svelte/draft-rows/TextCell.svelte?raw'
import svelteColumnsTsSource from '#/components/svelte/draft-rows/columns.ts?raw'
import svelteTypesTsSource from '#/components/svelte/draft-rows/types.ts?raw'
import svelteDraftsTsSource from '#/components/svelte/draft-rows/drafts.ts?raw'
import svelteDataTsSource from '#/components/svelte/draft-rows/data.ts?raw'

const files = [
  { path: 'src/components/draft-rows/data.ts', code: dataSource },
  { path: 'src/components/draft-rows/drafts.ts', code: draftsSource },
  { path: 'src/components/draft-rows/pickers.tsx', code: pickersSource },
  { path: 'src/components/draft-rows/columns.tsx', code: columnsSource },
  { path: 'src/components/draft-rows/data-table.tsx', code: dataTableSource },
  { path: 'src/components/draft-rows/index.tsx', code: indexSource },
]

const vueFiles = [
  {
    path: 'src/components/draft-rows/DraftRowsDemo.vue',
    code: vueDraftRowsDemoVueSource,
  },
  {
    path: 'src/components/draft-rows/DraftRowsTable.vue',
    code: vueDraftRowsTableVueSource,
  },
  {
    path: 'src/components/draft-rows/DraftField.vue',
    code: vueDraftFieldVueSource,
  },
  {
    path: 'src/components/draft-rows/columns.ts',
    code: vueColumnsTsSource,
  },
  {
    path: 'src/components/draft-rows/types.ts',
    code: vueTypesTsSource,
  },
  {
    path: 'src/components/draft-rows/drafts.ts',
    code: vueDraftsTsSource,
  },
  {
    path: 'src/components/draft-rows/data.ts',
    code: vueDataTsSource,
  },
]

const vueDeps = {
  npm: ['@lucide/vue', '@internationalized/date'],
  shadcn: ['button', 'calendar', 'input', 'popover', 'select', 'table'],
  valueUpdater: false,
}

const svelteFiles = [
  {
    path: 'src/lib/components/draft-rows/DraftRowsDemo.svelte',
    code: svelteDraftRowsDemoSvelteSource,
  },
  {
    path: 'src/lib/components/draft-rows/DraftRowsTable.svelte',
    code: svelteDraftRowsTableSvelteSource,
  },
  {
    path: 'src/lib/components/draft-rows/DraftField.svelte',
    code: svelteDraftFieldSvelteSource,
  },
  {
    path: 'src/lib/components/draft-rows/DraftActions.svelte',
    code: svelteDraftActionsSvelteSource,
  },
  {
    path: 'src/lib/components/draft-rows/TextCell.svelte',
    code: svelteTextCellSvelteSource,
  },
  {
    path: 'src/lib/components/draft-rows/columns.ts',
    code: svelteColumnsTsSource,
  },
  {
    path: 'src/lib/components/draft-rows/types.ts',
    code: svelteTypesTsSource,
  },
  {
    path: 'src/lib/components/draft-rows/drafts.ts',
    code: svelteDraftsTsSource,
  },
  {
    path: 'src/lib/components/draft-rows/data.ts',
    code: svelteDataTsSource,
  },
]

const svelteDeps = {
  npm: ['@lucide/svelte', '@internationalized/date'],
  shadcn: ['button', 'calendar', 'input', 'popover', 'select', 'table'],
  adapter: true,
}

const steps = [
  {
    title: 'Saved rows and drafts in one table',
    description:
      'The table gets one list: saved expenses, then the drafts, each tagged with its kind. Every column renders plain text for a saved row and an input for a draft, so new rows sit right under the ones they join, with the same columns. Drafts keep the raw text from their inputs until the batch is saved.',
    file: 'src/components/draft-rows/columns.tsx',
    code: `export type Row =
  | { kind: 'saved'; id: string; expense: Expense }
  | { kind: 'draft'; id: string; draft: Draft; number: number }`,
  },
  {
    title: 'Errors show when they are useful',
    description:
      'Rows are validated on every keystroke, but a field only shows its error after you leave it, so a half-typed row is not covered in red. Pressing Save with mistakes shows every error and moves focus to the first one. Blank rows are skipped, so an empty row at the end never blocks saving.',
    file: 'src/components/draft-rows/index.tsx',
    code: `const visible = (field) =>
  (attempted && !isBlank(draft)) || touched.has(\`\${id}:\${field}\`)`,
  },
  {
    title: 'Typing several rows from the keyboard',
    description:
      'The date is a shadcn date picker limited to the report period, and the category a shadcn Select; both count as touched when they close. In the description and amount, Enter moves to the same field one row down and adds a row at the end, starting on the date of the row above. Removing a row moves focus to its neighbour, so focus is never lost.',
    file: 'src/components/draft-rows/index.tsx',
    code: `if (i === drafts.length - 1) addRow(field)
else focusTarget.current = { id: drafts[i + 1].id, field }`,
  },
  {
    title: 'Possible duplicates warn, but do not block',
    description:
      'A draft with the same date, amount and description as a saved expense, or as another draft, gets a Duplicate? note. It is a warning rather than an error, because two identical taxi rides in a day can be real.',
    file: 'src/components/draft-rows/drafts.ts',
    code: `export function duplicates(drafts: Draft[], existing: Expense[]): Set<string>`,
  },
  {
    title: 'One save for the batch',
    description:
      'Save sends every filled row together and turns them into saved rows, which flash green for a moment. Discard asks once more before throwing away rows with something typed in.',
    file: 'src/components/draft-rows/index.tsx',
    code: `const added = summary.filled.map((d) => toExpense(d, newId()))
setSaved((s) => [...s, ...added].sort(byDate))
setDrafts([])`,
  },
]

export function DraftRowsTablePage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-normal tracking-tight text-balance sm:text-4xl">
            Shadcn Table with Draft Rows
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground text-balance">
            Type several new rows straight into the table, see what needs fixing
            as you go, then save or discard them together. Built here as an
            expense report; the same works for order items or stock counts.
          </p>
        </div>

        <InstallCommand name="draft-rows-table" />

        <ComponentPreview
          preview={<DraftRowsDemo />}
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
