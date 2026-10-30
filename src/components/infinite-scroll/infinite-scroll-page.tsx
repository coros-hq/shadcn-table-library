import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import tableSource from './data-table.tsx?raw'
import columnsSource from './columns.tsx?raw'
import hookSource from './use-infinite-rows.ts?raw'
import dataSource from './data.ts?raw'
import demoSource from './index.tsx?raw'
import { InfiniteScrollDemo } from './index'
import vueInfiniteScrollDemoSource from '#/components/vue/infinite-scroll/InfiniteScrollDemo.vue?raw'
import vueInfiniteScrollTableSource from '#/components/vue/infinite-scroll/InfiniteScrollTable.vue?raw'
import vueInfiniteScrollColumnsSource from '#/components/vue/infinite-scroll/columns.ts?raw'
import vueInfiniteScrollHookSource from '#/components/vue/infinite-scroll/use-infinite-rows.ts?raw'
import vueInfiniteScrollDataSource from '#/components/vue/infinite-scroll/data.ts?raw'
import svelteInfiniteScrollDemoSource from '#/components/svelte/infinite-scroll/InfiniteScrollDemo.svelte?raw'
import svelteInfiniteScrollTableSource from '#/components/svelte/infinite-scroll/InfiniteScrollTable.svelte?raw'
import svelteInfiniteScrollColumnsSource from '#/components/svelte/infinite-scroll/columns.ts?raw'
import svelteInfiniteScrollHookSource from '#/components/svelte/infinite-scroll/use-infinite-rows.svelte.ts?raw'
import svelteInfiniteScrollDataSource from '#/components/svelte/infinite-scroll/data.ts?raw'
import svelteCustomercellSource from '#/components/svelte/infinite-scroll/CustomerCell.svelte?raw'
import svelteDatecellSource from '#/components/svelte/infinite-scroll/DateCell.svelte?raw'
import svelteMoneycellSource from '#/components/svelte/infinite-scroll/MoneyCell.svelte?raw'
import svelteStatusbadgeSource from '#/components/svelte/infinite-scroll/StatusBadge.svelte?raw'
import svelteTransactionidSource from '#/components/svelte/infinite-scroll/TransactionId.svelte?raw'

const files = [
  { path: 'src/components/infinite-scroll/data-table.tsx', code: tableSource },
  {
    path: 'src/components/infinite-scroll/use-infinite-rows.ts',
    code: hookSource,
  },
  { path: 'src/components/infinite-scroll/columns.tsx', code: columnsSource },
  { path: 'src/components/infinite-scroll/data.ts', code: dataSource },
  { path: 'src/components/infinite-scroll/index.tsx', code: demoSource },
]

const vueFiles = [
  {
    path: 'src/components/infinite-scroll/InfiniteScrollDemo.vue',
    code: vueInfiniteScrollDemoSource,
  },
  {
    path: 'src/components/infinite-scroll/InfiniteScrollTable.vue',
    code: vueInfiniteScrollTableSource,
  },
  {
    path: 'src/components/infinite-scroll/columns.ts',
    code: vueInfiniteScrollColumnsSource,
  },
  {
    path: 'src/components/infinite-scroll/use-infinite-rows.ts',
    code: vueInfiniteScrollHookSource,
  },
  {
    path: 'src/components/infinite-scroll/data.ts',
    code: vueInfiniteScrollDataSource,
  },
]

const vueDeps = {
  npm: [],
  shadcn: ['badge', 'button', 'skeleton', 'table'],
}

const svelteFiles = [
  {
    path: 'src/lib/components/infinite-scroll/InfiniteScrollDemo.svelte',
    code: svelteInfiniteScrollDemoSource,
  },
  {
    path: 'src/lib/components/infinite-scroll/InfiniteScrollTable.svelte',
    code: svelteInfiniteScrollTableSource,
  },
  {
    path: 'src/lib/components/infinite-scroll/columns.ts',
    code: svelteInfiniteScrollColumnsSource,
  },
  {
    path: 'src/lib/components/infinite-scroll/use-infinite-rows.svelte.ts',
    code: svelteInfiniteScrollHookSource,
  },
  {
    path: 'src/lib/components/infinite-scroll/data.ts',
    code: svelteInfiniteScrollDataSource,
  },
  {
    path: 'src/lib/components/infinite-scroll/CustomerCell.svelte',
    code: svelteCustomercellSource,
  },
  {
    path: 'src/lib/components/infinite-scroll/DateCell.svelte',
    code: svelteDatecellSource,
  },
  {
    path: 'src/lib/components/infinite-scroll/MoneyCell.svelte',
    code: svelteMoneycellSource,
  },
  {
    path: 'src/lib/components/infinite-scroll/StatusBadge.svelte',
    code: svelteStatusbadgeSource,
  },
  {
    path: 'src/lib/components/infinite-scroll/TransactionId.svelte',
    code: svelteTransactionidSource,
  },
]

const svelteDeps = {
  npm: [],
  shadcn: ['badge', 'button', 'skeleton', 'table'],
  adapter: true,
}

const steps = [
  {
    title: 'A sentinel row triggers the next page, not a scroll listener',
    description:
      'An empty element sits after the last row, and an IntersectionObserver watches it inside the scroll container. When it comes within 160px of the visible area the next page is requested, so there is no scroll handler to throttle and no scrollTop arithmetic to get wrong.',
    file: 'src/components/infinite-scroll/data-table.tsx',
    code: `const observer = new IntersectionObserver(
  (entries) => {
    if (entries.some((entry) => entry.isIntersecting)) void loadMore()
  },
  { root: scrollRef.current, rootMargin: '0px 0px 160px 0px' },
)
observer.observe(sentinel)`,
  },
  {
    title: 'The observer is rebuilt after every page',
    description:
      'An observer only reports when the sentinel enters or leaves view. If a page is short enough that the sentinel never leaves, nothing would fire again and loading would stall. Depending on rows.length recreates the observer per page, and a new observer reports the sentinel position immediately.',
    file: 'src/components/infinite-scroll/data-table.tsx',
    code: `useEffect(() => {
  if (!canAutoLoad || !sentinel) return
  // ...create and observe
  return () => observer.disconnect()
}, [canAutoLoad, loadMore, rows.length])`,
  },
  {
    title: 'A ref guards against duplicate requests',
    description:
      'Two observer callbacks can fire before React re-renders, which would fetch the same page twice and duplicate rows. The in-flight flag is a ref rather than state so it updates synchronously, and the cursor lives in a ref for the same reason.',
    file: 'src/components/infinite-scroll/use-infinite-rows.ts',
    code: `const loadMore = useCallback(async () => {
  if (inFlight.current || cursor.current === null) return
  inFlight.current = true
  setStatus('loading')
  // ...fetch, append rows, advance the cursor
}, [fetchPage])`,
  },
  {
    title: 'Errors pause auto-loading until the user retries',
    description:
      'Auto-loading is only enabled while the status is idle. After a failed request the sentinel is still in view, so without that check the observer would hammer the failing endpoint. Instead an inline Retry button calls loadMore again. The demo fails once at row 100 so you can see it.',
    file: 'src/components/infinite-scroll/data-table.tsx',
    code: `const canAutoLoad = hasMore && status === 'idle'`,
  },
  {
    title: 'A sticky header needs the table wrapper to stop scrolling',
    description:
      "The shadcn Table wraps the table in a div with overflow-x-auto, which silently becomes the sticky header's scroll parent and stops it sticking. The outer container owns both scroll axes instead, and the arbitrary variant switches the wrapper back to overflow-visible.",
    file: 'src/components/infinite-scroll/data-table.tsx',
    code: `<div className="max-h-96 overflow-auto [&_[data-slot=table-container]]:overflow-visible">
  <Table>
    <TableHeader className="sticky top-0 z-10 bg-background">`,
  },
]

export function InfiniteScrollPage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-normal tracking-tight sm:text-4xl">
            Shadcn Infinite Scroll Table
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground text-balance">
            A table that loads the next page as you scroll instead of showing
            pagination controls. Pages come from a cursor-based fetcher, with
            skeleton rows while loading, an inline Retry when a request fails,
            and a sticky header.
          </p>
        </div>

        <InstallCommand name="infinite-scroll-table" />

        <ComponentPreview
          preview={<InfiniteScrollDemo />}
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
