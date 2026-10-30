import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import dataSource from './data.ts?raw'
import dataTableSource from './data-table.tsx?raw'
import indexSource from './index.tsx?raw'
import { LoadingStateTableDemo } from './index'
import vueLoadingStateTableDemoSource from '#/components/vue/loading-state/LoadingStateTableDemo.vue?raw'
import vueDataTableSource from '#/components/vue/loading-state/DataTable.vue?raw'
import vueColumnsSource from '#/components/vue/loading-state/columns.ts?raw'
import vueDataSource from '#/components/vue/loading-state/data.ts?raw'
import svelteLoadingStateTableDemoSource from '#/components/svelte/loading-state/LoadingStateTableDemo.svelte?raw'
import svelteDataTableSource from '#/components/svelte/loading-state/DataTable.svelte?raw'
import svelteColumnsSource from '#/components/svelte/loading-state/columns.ts?raw'
import svelteCustomerCellSource from '#/components/svelte/loading-state/CustomerCell.svelte?raw'
import svelteStatusBadgeSource from '#/components/svelte/loading-state/StatusBadge.svelte?raw'
import svelteAmountCellSource from '#/components/svelte/loading-state/AmountCell.svelte?raw'
import svelteDataSource from '#/components/svelte/loading-state/data.ts?raw'

const files = [
  { path: 'src/components/loading-state/data.ts', code: dataSource },
  {
    path: 'src/components/loading-state/data-table.tsx',
    code: dataTableSource,
  },
  { path: 'src/components/loading-state/index.tsx', code: indexSource },
]

const vueFiles = [
  {
    path: 'src/components/loading-state/LoadingStateTableDemo.vue',
    code: vueLoadingStateTableDemoSource,
  },
  {
    path: 'src/components/loading-state/DataTable.vue',
    code: vueDataTableSource,
  },
  { path: 'src/components/loading-state/columns.ts', code: vueColumnsSource },
  { path: 'src/components/loading-state/data.ts', code: vueDataSource },
]

const vueDeps = {
  npm: ['@lucide/vue'],
  shadcn: ['badge', 'button', 'skeleton', 'table'],
}

const svelteFiles = [
  {
    path: 'src/lib/components/loading-state/LoadingStateTableDemo.svelte',
    code: svelteLoadingStateTableDemoSource,
  },
  {
    path: 'src/lib/components/loading-state/DataTable.svelte',
    code: svelteDataTableSource,
  },
  {
    path: 'src/lib/components/loading-state/columns.ts',
    code: svelteColumnsSource,
  },
  {
    path: 'src/lib/components/loading-state/CustomerCell.svelte',
    code: svelteCustomerCellSource,
  },
  {
    path: 'src/lib/components/loading-state/StatusBadge.svelte',
    code: svelteStatusBadgeSource,
  },
  {
    path: 'src/lib/components/loading-state/AmountCell.svelte',
    code: svelteAmountCellSource,
  },
  { path: 'src/lib/components/loading-state/data.ts', code: svelteDataSource },
]

const svelteDeps = {
  npm: ['@lucide/svelte'],
  shadcn: ['badge', 'button', 'skeleton', 'table'],
  adapter: true,
}

const steps = [
  {
    title: "Skeleton rows are built from the table's own columns",
    description:
      'The loading branch maps over table.getAllLeafColumns() instead of hard-coding cells, so the placeholder always has the same number of columns as the real table \u2014 add or hide a column and the skeleton follows.',
    file: 'src/components/loading-state/data-table.tsx',
    code: `{isLoading
  ? Array.from({ length: skeletonRows }, (_, rowIndex) => (
      <TableRow key={rowIndex}>
        {leafColumns.map((column) => (
          <TableCell key={column.id}>
            <Skeleton className="h-4 w-3/4" />
          </TableCell>
        ))}
      </TableRow>
    ))
  : /* real rows */}`,
  },
  {
    title: 'Widths vary so it reads as content',
    description:
      'A fixed pool of widths is indexed by row and column, so neighbouring cells get different lengths. Uniform bars look like a grid; varied bars look like text about to appear. The right-aligned amount column pushes its bar to the right edge to match the real cell.',
    file: 'src/components/loading-state/data-table.tsx',
    code: `const SKELETON_WIDTHS = ['w-3/4', 'w-1/2', 'w-2/3', 'w-5/6', 'w-1/3']

<Skeleton className={cn('h-4', SKELETON_WIDTHS[(rowIndex + colIndex) % SKELETON_WIDTHS.length])} />`,
  },
  {
    title: 'First load vs. refetch are different states',
    description:
      "isLoading means there is nothing to show yet, so the body is replaced with skeletons. isFetching means rows already exist, so they stay visible, get dimmed, and a thin progress line appears at the top. Swapping real rows for skeletons on every refetch makes the table flash and loses the user's place.",
    file: 'src/components/loading-state/data-table.tsx',
    code: `<TableBody className={cn(isFetching && 'opacity-60 transition-opacity')}>

{isFetching && !isLoading && (
  <div className="absolute inset-x-0 top-0 z-10 h-0.5 animate-pulse bg-primary" />
)}`,
  },
  {
    title: 'aria-busy tells assistive tech the table is updating',
    description:
      "The wrapper sets aria-busy while loading or fetching, so screen readers don't announce half-loaded content.",
    file: 'src/components/loading-state/data-table.tsx',
    code: `<div className="relative overflow-hidden rounded-md border" aria-busy={isLoading || isFetching}>`,
  },
  {
    title: 'The demo ignores superseded responses',
    description:
      "Each request gets an incrementing id, and a response is only applied if it still matches the latest id. Clicking Reload twice quickly can't let the slower, older response overwrite the newer one.",
    file: 'src/components/loading-state/index.tsx',
    code: `const id = ++requestId.current
// ...
const result = await fetchInvoices()
if (id !== requestId.current) return // a newer request owns the table now
setData(result)`,
  },
]

export function LoadingStateTablePage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-normal tracking-tight sm:text-4xl">
            Shadcn Loading State Table
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground text-balance">
            Skeleton rows for the first load and a dimmed, still-interactive
            table for background refetches — so the table never collapses to a
            blank box or a lone spinner while data is on its way.
          </p>
        </div>

        <InstallCommand name="loading-state-table" />

        <ComponentPreview
          preview={<LoadingStateTableDemo />}
          files={files}
          vueFiles={vueFiles}
          vueDeps={vueDeps}
          svelteFiles={svelteFiles}
          svelteDeps={svelteDeps}
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
