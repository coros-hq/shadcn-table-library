import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import dataSource from './data.ts?raw'
import diffSource from './diff.ts?raw'
import diffPanelSource from './diff-panel.tsx?raw'
import columnsSource from './columns.tsx?raw'
import dataTableSource from './data-table.tsx?raw'
import indexSource from './index.tsx?raw'
import { ChangeReviewDemo } from './index'
import vueChangeReviewDemoVueSource from '#/components/vue/change-review/ChangeReviewDemo.vue?raw'
import vueChangeReviewTableVueSource from '#/components/vue/change-review/ChangeReviewTable.vue?raw'
import vueDiffPanelVueSource from '#/components/vue/change-review/DiffPanel.vue?raw'
import vueColumnsTsSource from '#/components/vue/change-review/columns.ts?raw'
import vueDiffTsSource from '#/components/vue/change-review/diff.ts?raw'
import vueDataTsSource from '#/components/vue/change-review/data.ts?raw'
import svelteChangeReviewDemoSvelteSource from '#/components/svelte/change-review/ChangeReviewDemo.svelte?raw'
import svelteChangeReviewTableSvelteSource from '#/components/svelte/change-review/ChangeReviewTable.svelte?raw'
import svelteDiffPanelSvelteSource from '#/components/svelte/change-review/DiffPanel.svelte?raw'
import svelteColumnsTsSource from '#/components/svelte/change-review/columns.ts?raw'
import svelteProductCellSvelteSource from '#/components/svelte/change-review/ProductCell.svelte?raw'
import svelteValueCellSvelteSource from '#/components/svelte/change-review/ValueCell.svelte?raw'
import svelteReviewCellSvelteSource from '#/components/svelte/change-review/ReviewCell.svelte?raw'
import svelteHeaderLabelSvelteSource from '#/components/svelte/change-review/HeaderLabel.svelte?raw'
import svelteDiffTsSource from '#/components/svelte/change-review/diff.ts?raw'
import svelteDataTsSource from '#/components/svelte/change-review/data.ts?raw'

const files = [
  { path: 'src/components/change-review/data.ts', code: dataSource },
  { path: 'src/components/change-review/diff.ts', code: diffSource },
  {
    path: 'src/components/change-review/diff-panel.tsx',
    code: diffPanelSource,
  },
  { path: 'src/components/change-review/columns.tsx', code: columnsSource },
  {
    path: 'src/components/change-review/data-table.tsx',
    code: dataTableSource,
  },
  { path: 'src/components/change-review/index.tsx', code: indexSource },
]

const vueFiles = [
  {
    path: 'src/components/change-review/ChangeReviewDemo.vue',
    code: vueChangeReviewDemoVueSource,
  },
  {
    path: 'src/components/change-review/ChangeReviewTable.vue',
    code: vueChangeReviewTableVueSource,
  },
  {
    path: 'src/components/change-review/DiffPanel.vue',
    code: vueDiffPanelVueSource,
  },
  {
    path: 'src/components/change-review/columns.ts',
    code: vueColumnsTsSource,
  },
  {
    path: 'src/components/change-review/diff.ts',
    code: vueDiffTsSource,
  },
  {
    path: 'src/components/change-review/data.ts',
    code: vueDataTsSource,
  },
]

const vueDeps = {
  npm: ['@lucide/vue'],
  shadcn: ['badge', 'button', 'checkbox', 'table'],
  valueUpdater: false,
}

const svelteFiles = [
  {
    path: 'src/lib/components/change-review/ChangeReviewDemo.svelte',
    code: svelteChangeReviewDemoSvelteSource,
  },
  {
    path: 'src/lib/components/change-review/ChangeReviewTable.svelte',
    code: svelteChangeReviewTableSvelteSource,
  },
  {
    path: 'src/lib/components/change-review/DiffPanel.svelte',
    code: svelteDiffPanelSvelteSource,
  },
  {
    path: 'src/lib/components/change-review/columns.ts',
    code: svelteColumnsTsSource,
  },
  {
    path: 'src/lib/components/change-review/ProductCell.svelte',
    code: svelteProductCellSvelteSource,
  },
  {
    path: 'src/lib/components/change-review/ValueCell.svelte',
    code: svelteValueCellSvelteSource,
  },
  {
    path: 'src/lib/components/change-review/ReviewCell.svelte',
    code: svelteReviewCellSvelteSource,
  },
  {
    path: 'src/lib/components/change-review/HeaderLabel.svelte',
    code: svelteHeaderLabelSvelteSource,
  },
  {
    path: 'src/lib/components/change-review/diff.ts',
    code: svelteDiffTsSource,
  },
  {
    path: 'src/lib/components/change-review/data.ts',
    code: svelteDataTsSource,
  },
]

const svelteDeps = {
  npm: ['@lucide/svelte'],
  shadcn: ['badge', 'button', 'checkbox', 'table'],
  adapter: true,
}

const steps = [
  {
    title: 'Each change is a before and an after',
    description:
      'An update carries both versions of the record, a new record only the after, and a removed one only the before. The changed fields are worked out by comparing the two, so the bulk update needs no list of what changed.',
    file: 'src/components/change-review/data.ts',
    code: `type Change =
  | { id: string; kind: 'update'; before: Product; after: Product }
  | { id: string; kind: 'create'; after: Product }
  | { id: string; kind: 'delete'; before: Product }`,
  },
  {
    title: 'Decisions are kept per field, not per row',
    description:
      'Every changed field has a key like "p3.price". Accepting or rejecting a cell sets that key; the row buttons set all of a row\'s keys at once. Anything without a key is still to review, so the row\'s state (to review, in progress, accepted, rejected, partly accepted) is derived rather than stored.',
    file: 'src/components/change-review/diff.ts',
    code: `export function rowState(change, decisions): RowState {
  const made = keysOf(change).map((k) => decisions[k])
  const pending = made.filter((d) => !d).length
  if (pending === made.length) return 'pending'
  if (pending) return 'partial'
  ...
}`,
  },
  {
    title: 'The table is the catalog; the panel is the diff',
    description:
      'The table lists every product as it is today, so the update reads in context. Rows with changes to review are tinted with an amber edge, and the values that would change carry a dot. Clicking one slides a card in over the right of the table, inside the same frame, with the product as a diff: unchanged fields as context, each change as a "−" line for the old value and a "+" line for the new one.',
    file: 'src/components/change-review/diff-panel.tsx',
    code: `  Name      Oak Standing Desk
− Price     $649
+ Price     $699   +7.7%
− Stock     8
+ Stock     0      -8
  Category  Desks`,
  },
  {
    title: 'Deciding moves on to the next product',
    description:
      'Accept or reject at the bottom of the panel, and it opens the next product still to review, so a whole update can be worked through without going back to the table. When a product has several changes, each "+" line has a checkbox: tick the ones to keep, and the buttons then finish the rest. The arrows in the header step through every product with changes, decided or not, and Escape closes the panel.',
    file: 'src/components/change-review/index.tsx',
    code: `function decideKeys(keys, decision, advance = false) {
  const next = decide(decisions, keys, decision)
  setDecisions(next)
  if (advance) setOpenId(nextToReview(openId, next))
}`,
  },
  {
    title: '"To review" works as a queue',
    description:
      'The view filter is a column filter whose value includes the decisions, so deciding a row\'s last change drops it out of "To review" straight away. The filter value is memoized: a new object on every render would make TanStack recompute the rows each time.',
    file: 'src/components/change-review/data-table.tsx',
    code: `const columnFilters = useMemo(
  () => view === 'all' ? [] : [{ id: 'product', value: { view, decisions } }],
  [view, decisions],
)`,
  },
  {
    title: 'Applying writes only accepted changes',
    description:
      "apply() starts from each record's before and copies over only the accepted fields. New records are added and removals happen only when accepted. Changes still to review are left as they are, so a partial review is safe to apply.",
    file: 'src/components/change-review/diff.ts',
    code: `const next = { ...change.before }
for (const f of changedFields(change)) {
  if (decisions[changeKey(change.id, f)] === 'accepted') next[f] = change.after[f]
}`,
  },
]

export function ChangeReviewTablePage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-normal tracking-tight sm:text-4xl">
            Shadcn Diff / Change Review Table
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground text-balance">
            Review a bulk update before it lands: products with changes are
            highlighted in the catalog, and clicking one opens its changes as a
            diff to accept or reject, field by field or all at once.
          </p>
        </div>

        <InstallCommand name="change-review-table" />

        <ComponentPreview
          preview={<ChangeReviewDemo />}
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
