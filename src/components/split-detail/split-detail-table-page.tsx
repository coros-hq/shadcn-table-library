import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import dataSource from './data.ts?raw'
import ticketsSource from './tickets.ts?raw'
import columnsSource from './columns.tsx?raw'
import dataTableSource from './data-table.tsx?raw'
import ticketPanelSource from './ticket-panel.tsx?raw'
import indexSource from './index.tsx?raw'
import { SplitDetailDemo } from './index'
import vueSplitDetailDemoVueSource from '#/components/vue/split-detail/SplitDetailDemo.vue?raw'
import vueTicketPanelVueSource from '#/components/vue/split-detail/TicketPanel.vue?raw'
import vueTicketTableVueSource from '#/components/vue/split-detail/TicketTable.vue?raw'
import vueTableTsSource from '#/components/vue/split-detail/table.ts?raw'
import vueColumnsTsSource from '#/components/vue/split-detail/columns.ts?raw'
import vueStatusBadgeVueSource from '#/components/vue/split-detail/StatusBadge.vue?raw'
import vuePriorityLabelVueSource from '#/components/vue/split-detail/PriorityLabel.vue?raw'
import vueStylesTsSource from '#/components/vue/split-detail/styles.ts?raw'
import vueTicketsTsSource from '#/components/vue/split-detail/tickets.ts?raw'
import vueDataTsSource from '#/components/vue/split-detail/data.ts?raw'
import svelteSplitDetailDemoSvelteSource from '#/components/svelte/split-detail/SplitDetailDemo.svelte?raw'
import svelteTicketPanelSvelteSource from '#/components/svelte/split-detail/TicketPanel.svelte?raw'
import svelteTicketTableSvelteSource from '#/components/svelte/split-detail/TicketTable.svelte?raw'
import svelteTableTsSource from '#/components/svelte/split-detail/table.ts?raw'
import svelteColumnsTsSource from '#/components/svelte/split-detail/columns.ts?raw'
import svelteSubjectCellSvelteSource from '#/components/svelte/split-detail/SubjectCell.svelte?raw'
import svelteStatusBadgeSvelteSource from '#/components/svelte/split-detail/StatusBadge.svelte?raw'
import sveltePriorityLabelSvelteSource from '#/components/svelte/split-detail/PriorityLabel.svelte?raw'
import svelteSortHeaderSvelteSource from '#/components/svelte/split-detail/SortHeader.svelte?raw'
import svelteTextCellSvelteSource from '#/components/svelte/split-detail/TextCell.svelte?raw'
import svelteStylesTsSource from '#/components/svelte/split-detail/styles.ts?raw'
import svelteTicketsTsSource from '#/components/svelte/split-detail/tickets.ts?raw'
import svelteDataTsSource from '#/components/svelte/split-detail/data.ts?raw'

const files = [
  { path: 'src/components/split-detail/data.ts', code: dataSource },
  { path: 'src/components/split-detail/tickets.ts', code: ticketsSource },
  { path: 'src/components/split-detail/columns.tsx', code: columnsSource },
  { path: 'src/components/split-detail/data-table.tsx', code: dataTableSource },
  {
    path: 'src/components/split-detail/ticket-panel.tsx',
    code: ticketPanelSource,
  },
  { path: 'src/components/split-detail/index.tsx', code: indexSource },
]

const vueFiles = [
  {
    path: 'src/components/split-detail/SplitDetailDemo.vue',
    code: vueSplitDetailDemoVueSource,
  },
  {
    path: 'src/components/split-detail/TicketPanel.vue',
    code: vueTicketPanelVueSource,
  },
  {
    path: 'src/components/split-detail/TicketTable.vue',
    code: vueTicketTableVueSource,
  },
  {
    path: 'src/components/split-detail/table.ts',
    code: vueTableTsSource,
  },
  {
    path: 'src/components/split-detail/columns.ts',
    code: vueColumnsTsSource,
  },
  {
    path: 'src/components/split-detail/StatusBadge.vue',
    code: vueStatusBadgeVueSource,
  },
  {
    path: 'src/components/split-detail/PriorityLabel.vue',
    code: vuePriorityLabelVueSource,
  },
  {
    path: 'src/components/split-detail/styles.ts',
    code: vueStylesTsSource,
  },
  {
    path: 'src/components/split-detail/tickets.ts',
    code: vueTicketsTsSource,
  },
  {
    path: 'src/components/split-detail/data.ts',
    code: vueDataTsSource,
  },
]

const vueDeps = {
  npm: ['@lucide/vue'],
  shadcn: ['badge', 'button', 'label', 'select', 'table'],
  valueUpdater: true,
}

const svelteFiles = [
  {
    path: 'src/lib/components/split-detail/SplitDetailDemo.svelte',
    code: svelteSplitDetailDemoSvelteSource,
  },
  {
    path: 'src/lib/components/split-detail/TicketPanel.svelte',
    code: svelteTicketPanelSvelteSource,
  },
  {
    path: 'src/lib/components/split-detail/TicketTable.svelte',
    code: svelteTicketTableSvelteSource,
  },
  {
    path: 'src/lib/components/split-detail/table.ts',
    code: svelteTableTsSource,
  },
  {
    path: 'src/lib/components/split-detail/columns.ts',
    code: svelteColumnsTsSource,
  },
  {
    path: 'src/lib/components/split-detail/SubjectCell.svelte',
    code: svelteSubjectCellSvelteSource,
  },
  {
    path: 'src/lib/components/split-detail/StatusBadge.svelte',
    code: svelteStatusBadgeSvelteSource,
  },
  {
    path: 'src/lib/components/split-detail/PriorityLabel.svelte',
    code: sveltePriorityLabelSvelteSource,
  },
  {
    path: 'src/lib/components/split-detail/SortHeader.svelte',
    code: svelteSortHeaderSvelteSource,
  },
  {
    path: 'src/lib/components/split-detail/TextCell.svelte',
    code: svelteTextCellSvelteSource,
  },
  {
    path: 'src/lib/components/split-detail/styles.ts',
    code: svelteStylesTsSource,
  },
  {
    path: 'src/lib/components/split-detail/tickets.ts',
    code: svelteTicketsTsSource,
  },
  {
    path: 'src/lib/components/split-detail/data.ts',
    code: svelteDataTsSource,
  },
]

const svelteDeps = {
  npm: ['@lucide/svelte'],
  shadcn: ['badge', 'button', 'label', 'select', 'table'],
  adapter: true,
}

const steps = [
  {
    title: 'The panel pushes the table, it does not cover it',
    description:
      'The table and the panel sit side by side in one frame. Opening a ticket widens the panel and narrows the table, which hides its least useful columns to make room. The table scrolls in its own area, so its filter, sort, page and scroll position stay exactly as they were. On phones the panel covers the table instead.',
    file: 'src/components/split-detail/ticket-panel.tsx',
    code: `open
  ? 'visible w-full border-l transition-[width] sm:w-[26rem]'
  : 'invisible w-0 transition-[width,visibility]'`,
  },
  {
    title: 'The open row stays put, even when it stops matching',
    description:
      'The open ticket is highlighted and marked aria-current. If you set an open ticket to Pending while looking at Open tickets, it stays in the list until you close it, with a note saying so, so the row you are working on never vanishes from under you. It also keeps its place in the sort: editing it stamps it as just updated, but it sorts by the values it had when opened.',
    file: 'src/components/split-detail/columns.tsx',
    code: `filterFn: (row, _id, { view, keep }: StatusFilter) =>
  row.original.id === keep || inView(row.original, view),`,
  },
  {
    title: 'Review one ticket after another',
    description:
      'Clicking another subject replaces the panel. The panel’s previous and next buttons walk the filtered, sorted list across pages, turning the table’s page when needed. That is why the table instance lives in the demo: the panel needs its order.',
    file: 'src/components/split-detail/index.tsx',
    code: `const order = table.getPrePaginationRowModel().rows.map((r) => r.id)
function go(id: string) {
  setOpenId(id)
  setPagination((p) => ({ ...p, pageIndex: Math.floor(order.indexOf(id) / PAGE_SIZE) }))
}`,
  },
  {
    title: 'Edit in place',
    description:
      'Status, priority and assignee are shadcn Selects that update the row as you change them. Replying adds to the conversation and moves an open ticket to Pending, since it now waits on the customer. Editing never resets the page, because autoResetPageIndex is off.',
    file: 'src/components/split-detail/tickets.ts',
    code: `status: t.status === 'open' ? 'pending' : t.status,`,
  },
  {
    title: 'Focus goes where you expect',
    description:
      'Opening a ticket from the table moves focus to its subject in the panel, so screen readers announce it. Previous and next keep focus on the button you pressed. Escape or the close button returns focus to the subject in the table that opened the panel.',
    file: 'src/components/split-detail/ticket-panel.tsx',
    code: `document.querySelector(\`[data-ticket-id="\${lastId.current}"]\`)?.focus()`,
  },
]

export function SplitDetailTablePage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-normal tracking-tight text-balance sm:text-4xl">
            Shadcn Table with Split Detail Panel
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground text-balance">
            Open a record beside the table to read and edit it, then move on to
            the next one without losing your filter, sort or place in the list.
            Shown as a support ticket queue.
          </p>
        </div>

        <InstallCommand name="split-detail-table" />

        <ComponentPreview
          preview={<SplitDetailDemo />}
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
