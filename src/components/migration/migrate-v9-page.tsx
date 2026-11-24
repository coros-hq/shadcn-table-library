import { Link } from '@tanstack/react-router'

import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import {
  FrameworkToggle,
  useSnippetFramework,
} from '#/components/docs/framework-toggle.tsx'
import type { SnippetFramework } from '#/components/docs/framework-toggle.tsx'
import featuresSource from '#/lib/table-v9-features.ts?raw'
import svelteFeaturesSource from '#/components/svelte/v9/shared/table-v9-features.ts?raw'

interface Snippet {
  filename: string
  code: string
}

interface Section {
  title: string
  description: string
  before: Snippet
  after: Snippet
  note?: string
}

const sections: Record<SnippetFramework, Section[]> = {
  react: [
    {
      title: 'Register features and row models',
      description:
        'v8 bundled every feature and took row models as get*RowModel() options. v9 asks you to say what the table uses: you build a features object once, pass it as `features`, and row models become named slots inside it. getCoreRowModel() is gone; the core row model is automatic.',
      before: {
        filename: 'v8',
        code: `import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getSortedRowModel: getSortedRowModel(),
})`,
      },
      after: {
        filename: 'v9',
        code: `import {
  columnFilteringFeature,
  createFilteredRowModel,
  createSortedRowModel,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'

const features = tableFeatures({
  columnFilteringFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
})

const table = useTable({ features, data, columns })`,
      },
      note: 'If a table method is missing in v9, the feature that owns it is usually not registered, not removed. Declare a feature before the row model that depends on it.',
    },
    {
      title: 'Add the features type to your column and table types',
      description:
        'Every table type now starts with the type of your features object, so TypeScript knows which methods exist. Use `typeof features` rather than writing it out. Row data must also be an object or array, which is why generic components in these examples became `TData extends RowData`.',
      before: {
        filename: 'v8',
        code: `export const columns: ColumnDef<User>[] = [...]

function PinControls<TData>({
  column,
}: {
  column: Column<TData, unknown>
}) {}`,
      },
      after: {
        filename: 'v9',
        code: `export const columns: ColumnDef<typeof features, User>[] = [...]

function PinControls<TData extends RowData>({
  column,
}: {
  column: Column<typeof features, TData, unknown>
}) {}`,
      },
    },
    {
      title: 'Rename sorting functions',
      description:
        'Everything called sortingFn is now sortFn, including the column option, the registry in tableFeatures(), and the type names.',
      before: {
        filename: 'v8',
        code: `{ accessorKey: 'name', sortingFn: 'alphanumeric' }`,
      },
      after: {
        filename: 'v9',
        code: `{ accessorKey: 'name', sortFn: 'alphanumeric' }`,
      },
      note: 'filterFns, sortFns and aggregationFns are registered in tableFeatures() instead of being table options or global type augmentations.',
    },
    {
      title: 'Read state from the store',
      description:
        'table.getState() is replaced by table.state or table.store.state. A single onStateChange callback no longer exists; use the per-slice callbacks (onSortingChange, onPaginationChange, …) you already use for controlled state, or table.store.subscribe() to hear about every change.',
      before: {
        filename: 'v8',
        code: `const { pageIndex, pageSize } = table.getState().pagination`,
      },
      after: {
        filename: 'v9',
        code: `const { pageIndex, pageSize } = table.store.state.pagination`,
      },
      note: 'By default useTable still re-renders on every state change. To narrow that, pass a selector as the second argument or render <table.Subscribe selector={…}> around only the part that needs the state.',
    },
    {
      title: 'Pin columns to start and end',
      description:
        'Column pinning uses logical regions instead of physical sides. The state keys, the arguments to column.pin(), the values returned by getIsPinned(), and every left/right method family change together, so search for all of them.',
      before: {
        filename: 'v8',
        code: `const [pinning, setPinning] = useState({ left: [], right: [] })

column.pin('left')
column.getStart('left')
row.getLeftVisibleCells()`,
      },
      after: {
        filename: 'v9',
        code: `const [pinning, setPinning] = useState({ start: [], end: [] })

column.pin('start')
column.getStart('start')
row.getStartVisibleCells()`,
      },
      note: 'This is logical positioning, not automatic RTL styling. Your sticky CSS still decides which physical edge a pinned column sticks to.',
    },
    {
      title: 'Check selection and sizing behavior changes',
      description:
        'getIsSomeRowsSelected() and getIsSomePageRowsSelected() now mean at least one row, including when all rows are selected. Check the "all" case first, or exclude it, to compute an indeterminate checkbox. Column sizing is split in two: columnSizingFeature for widths and columnResizingFeature for dragging, and the columnSizingInfo state is now columnResizing.',
      before: {
        filename: 'v8',
        code: `const indeterminate = table.getIsSomeRowsSelected()`,
      },
      after: {
        filename: 'v9',
        code: `const indeterminate =
  table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()`,
      },
    },
  ],
  svelte: [
    {
      title: 'Drop the shadcn-svelte adapter for the native one',
      description:
        'The v8 Svelte ports in this repo drive @tanstack/table-core through three helper files (createSvelteTable, FlexRender, render-component) because @tanstack/svelte-table v8 only supported Svelte 3 and 4. v9 ships a native Svelte 5 adapter: createTable, FlexRender, renderComponent and renderSnippet come straight from @tanstack/svelte-table, and features/row models are registered once with tableFeatures().',
      before: {
        filename: 'v8',
        code: `import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
} from '@tanstack/table-core'
import {
  FlexRender,
  createSvelteTable,
} from '$lib/components/ui/data-table/index.js'

const table = createSvelteTable({
  get data() {
    return data
  },
  get columns() {
    return columns
  },
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getSortedRowModel: getSortedRowModel(),
})`,
      },
      after: {
        filename: 'v9',
        code: `import {
  createTable,
  createFilteredRowModel,
  createSortedRowModel,
  FlexRender,
  tableFeatures,
} from '@tanstack/svelte-table'

const features = tableFeatures({
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
})

const table = createTable({
  features,
  get data() {
    return data
  },
  get columns() {
    return columns
  },
})`,
      },
      note: 'Delete src/lib/components/ui/data-table/ — the files are no longer needed. Keep reactive inputs live with getters: v9 reads options on every update, and a getter is how a rune change reaches the table.',
    },
    {
      title: 'Add the features type to your column and table types',
      description:
        'Every table type now starts with the type of your features object, so TypeScript knows which methods exist. In Svelte components the `generics` attribute must satisfy RowData too: TData becomes `TData extends RowData`, and constrained generics keep their own shape after it.',
      before: {
        filename: 'v8',
        code: `<script lang="ts">
  import type { ColumnDef } from '@tanstack/table-core'

  export const columns: ColumnDef<User>[] = [...]
</script>

<script lang="ts" generics="TData">
  let { columns }: { columns: ColumnDef<TData, any>[] } = $props()
</script>`,
      },
      after: {
        filename: 'v9',
        code: `<script lang="ts">
  import type { ColumnDef } from '@tanstack/svelte-table'
  import type { V9Features } from '$lib/table-v9-features'

  export const columns: ColumnDef<V9Features, User>[] = [...]
</script>

<script lang="ts" generics="TData extends RowData">
  import type { ColumnDef, RowData } from '@tanstack/svelte-table'

  let { columns }: { columns: ColumnDef<V9Features, TData, any>[] } = $props()
</script>`,
      },
    },
    {
      title: 'Rename sorting functions',
      description:
        'Everything called sortingFn is now sortFn, including the column option, the registry in tableFeatures(), and the type names.',
      before: {
        filename: 'v8',
        code: `{ accessorKey: 'name', sortingFn: 'alphanumeric' }`,
      },
      after: {
        filename: 'v9',
        code: `{ accessorKey: 'name', sortFn: 'alphanumeric' }`,
      },
      note: 'filterFns, sortFns and aggregationFns are registered in tableFeatures() instead of being table options or global type augmentations.',
    },
    {
      title: 'Read state from the atoms',
      description:
        'There is no getState() and no overall onStateChange. Read a slice with table.atoms.<slice>.get(); inside a template, $derived or $effect that read becomes a Svelte dependency, so the UI updates on its own. Controlled slices use a getter-backed state object plus the matching onXChange callback, exactly like v8.',
      before: {
        filename: 'v8',
        code: `const { pageIndex, pageSize } = table.getState().pagination`,
      },
      after: {
        filename: 'v9',
        code: `const pagination = $derived(table.atoms.pagination.get())

// ...
const { pageIndex, pageSize } = pagination`,
      },
      note: 'Use table.store.get() only when you really need every slice (debug output, persistence). Reading it in a component re-runs on any state change.',
    },
    {
      title: 'Pin columns to start and end',
      description:
        'Column pinning uses logical regions instead of physical sides. The state keys, the arguments to column.pin(), the values returned by getIsPinned(), and every left/right method family change together, so search for all of them.',
      before: {
        filename: 'v8',
        code: `let pinning = $state<ColumnPinningState>({ left: [], right: [] })

column.pin('left')
column.getStart('left')
row.getLeftVisibleCells()`,
      },
      after: {
        filename: 'v9',
        code: `let pinning = $state<ColumnPinningState>({ start: [], end: [] })

column.pin('start')
column.getStart('start')
row.getStartVisibleCells()`,
      },
      note: 'This is logical positioning, not automatic RTL styling. Your sticky CSS still decides which physical edge a pinned column sticks to.',
    },
    {
      title: 'Check selection, sizing and FlexRender changes',
      description:
        'getIsSomeRowsSelected() and getIsSomePageRowsSelected() now mean at least one row, including when all rows are selected. Column sizing is split into columnSizingFeature (widths) and columnResizingFeature (dragging), and columnSizingInfo becomes columnResizing. FlexRender also stops taking content/context and takes the header or cell itself.',
      before: {
        filename: 'v8',
        code: `const indeterminate = table.getIsSomeRowsSelected()

<FlexRender
  content={header.column.columnDef.header}
  context={header.getContext()}
/>`,
      },
      after: {
        filename: 'v9',
        code: `const indeterminate = $derived(
  table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected(),
)

<FlexRender {header} />`,
      },
    },
  ],
}

const renames: Record<SnippetFramework, Array<[string, string]>> = {
  react: [
    ['useReactTable(options)', 'useTable({ ...options, features })'],
    ['getCoreRowModel()', 'removed (automatic)'],
    ['getSortedRowModel()', 'sortedRowModel: createSortedRowModel()'],
    ['getFilteredRowModel()', 'filteredRowModel: createFilteredRowModel()'],
    ['getPaginationRowModel()', 'paginatedRowModel: createPaginatedRowModel()'],
    ['getExpandedRowModel()', 'expandedRowModel: createExpandedRowModel()'],
    ['table.getState()', 'table.state / table.store.state'],
    ['onStateChange', 'per-slice onXChange or table.store.subscribe()'],
    ['sortingFn / sortingFns', 'sortFn / sortFns'],
    ['columnPinning { left, right }', 'columnPinning { start, end }'],
    ['enablePinning (table option)', 'enableColumnPinning + enableRowPinning'],
    ['columnSizingInfo', 'columnResizing'],
    ['ColumnDef<TData>', 'ColumnDef<TFeatures, TData>'],
    ['createColumnHelper<TData>()', 'createColumnHelper<TFeatures, TData>()'],
  ],
  svelte: [
    ['createSvelteTable(options)', 'createTable({ ...options, features })'],
    ['@tanstack/table-core', '@tanstack/svelte-table'],
    ['$lib/components/ui/data-table/*', 'removed (native adapter)'],
    ['getCoreRowModel()', 'removed (automatic)'],
    ['getSortedRowModel()', 'sortedRowModel: createSortedRowModel()'],
    ['getFilteredRowModel()', 'filteredRowModel: createFilteredRowModel()'],
    ['getPaginationRowModel()', 'paginatedRowModel: createPaginatedRowModel()'],
    ['getExpandedRowModel()', 'expandedRowModel: createExpandedRowModel()'],
    ['table.getState().pagination', 'table.atoms.pagination.get()'],
    ['onStateChange', 'per-slice onXChange or table.store.subscribe()'],
    ['sortingFn / sortingFns', 'sortFn / sortFns'],
    ['columnPinning { left, right }', 'columnPinning { start, end }'],
    ['enablePinning (table option)', 'enableColumnPinning + enableRowPinning'],
    ['columnSizingInfo', 'columnResizing'],
    ['ColumnDef<TData>', 'ColumnDef<TFeatures, TData>'],
    ['createColumnHelper<TData>()', 'createColumnHelper<TFeatures, TData>()'],
    ['<FlexRender content context />', '<FlexRender {header} /> / {cell}'],
  ],
}

const checklists: Record<SnippetFramework, string[]> = {
  react: [
    'Replace useReactTable with useTable and pass a features object.',
    'Remove getCoreRowModel and move every other row model into a feature slot.',
    'Register the features you use; a missing method usually means a missing feature.',
    'Add the features type to ColumnDef, Column, Table, Row and Cell types.',
    'Rename sortingFn to sortFn, and move filterFns, sortFns and aggregationFns into tableFeatures().',
    'Replace getState() and onStateChange.',
    'Rename pinning left/right to start/end in state, methods and arguments.',
    'Re-check indeterminate selection checkboxes.',
    'Call row, cell, column and header methods on the instance: they now live on prototypes, so destructured or spread copies lose them.',
    'Type-check, then try sorting, filtering, pagination, selection and any server-side flows by hand.',
  ],
  svelte: [
    'Install @tanstack/svelte-table@^9 and delete the table-core adapter files.',
    'Replace createSvelteTable with createTable and pass a features object.',
    'Remove getCoreRowModel and move every other row model into a feature slot.',
    'Keep reactive inputs live with getters: get data(), get columns(), state getters.',
    'Add the features type to ColumnDef, Column, Table, Row and Cell types, and add extends RowData to component generics.',
    'Rename sortingFn to sortFn, and move filterFns, sortFns and aggregationFns into tableFeatures().',
    'Replace table.getState() with table.atoms.<slice>.get().',
    'Replace FlexRender content/context props with {header} or {cell}.',
    'Rename pinning left/right to start/end in state, methods and arguments.',
    'Re-check indeterminate selection checkboxes, then exercise sorting, filtering, pagination and selection.',
  ],
}

export function MigrateV9Page() {
  const [framework, changeFramework] = useSnippetFramework()
  const activeSections = sections[framework]
  const activeRenames = renames[framework]
  const activeChecklist = checklists[framework]

  return (
    <DocsLayout>
      <section className="space-y-10">
        <div>
          <h1 className="text-3xl font-normal tracking-tight sm:text-4xl">
            Migrating from TanStack Table v8 to v9
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground text-balance">
            What changes in your shadcn/ui tables when you move to TanStack
            Table v9 — @tanstack/react-table in React, @tanstack/svelte-table in
            Svelte — with before and after code taken from the examples on this
            site. Every example here has a v8 and a v9 version, so you can
            compare any page side by side.
          </p>
          <div className="mt-3 max-w-2xl rounded-lg border p-3 text-sm text-muted-foreground">
            <p className="mb-2 font-medium text-foreground">Code tabs</p>
            <div className="flex items-center justify-between gap-3">
              <span>
                Choose a framework; the snippets, quick reference and checklist
                below switch with it.
              </span>
              <FrameworkToggle value={framework} onChange={changeFramework} />
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border p-4 text-sm">
          <p className="font-medium">The fast path: install the v9 version</p>
          {framework === 'react' ? (
            <>
              <p className="text-muted-foreground">
                If you have not installed a component yet, skip the migration.
                Every registry item has a v9 twin that adds the right dependency
                and a ready-made features file:
              </p>
              <CodeBlock
                filename="terminal"
                language="bash"
                code="npx shadcn add https://www.shad-table.dev/r/data-table-v9.json"
              />
              <p className="text-muted-foreground">
                On a page, switch to the{' '}
                <Link
                  to="/v9/data-table"
                  className="text-foreground underline underline-offset-4"
                >
                  v9 version
                </Link>{' '}
                and the install command updates itself.
              </p>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">
                The Svelte ports are source-only today, so there is no registry
                item to install. Add the native adapter, then copy the files
                from the Svelte tab of any example:
              </p>
              <CodeBlock
                filename="terminal"
                language="bash"
                code="npm i @tanstack/svelte-table@^9"
              />
              <p className="text-muted-foreground">
                Each tab also lists the shadcn-svelte primitives it uses, e.g.{' '}
                <code>npx shadcn-svelte@latest add table input button</code>.
              </p>
            </>
          )}
        </div>

        <div className="space-y-8">
          {activeSections.map((section, i) => (
            <div key={section.title} className="space-y-3">
              <h2 className="flex items-center gap-2 text-lg font-medium">
                <span className="text-muted-foreground">{i + 1}.</span>
                {section.title}
              </h2>
              <p className="max-w-2xl text-sm text-muted-foreground">
                {section.description}
              </p>
              <div className="grid gap-3 lg:grid-cols-2">
                <CodeBlock
                  filename={section.before.filename}
                  code={section.before.code}
                />
                <CodeBlock
                  filename={section.after.filename}
                  code={section.after.code}
                />
              </div>
              {section.note ? (
                <p className="max-w-2xl text-sm text-muted-foreground">
                  {section.note}
                </p>
              ) : null}
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-medium">Quick reference</h2>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-4 py-2 font-medium">v8</th>
                  <th className="px-4 py-2 font-medium">v9</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {activeRenames.map(([before, after]) => (
                  <tr key={before}>
                    <td className="px-4 py-2 font-mono text-xs">{before}</td>
                    <td className="px-4 py-2 font-mono text-xs">{after}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-medium">
            How the examples here handle features
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Every v9 example imports one shared features file that registers all
            stock features, every row model and every built-in function. That
            keeps behavior identical to v8's "everything included" default,
            which makes the examples easy to compare. It is not tree-shaken: in
            your own app, replace it with only the features and row models your
            table actually uses, as in step 1.
          </p>
          <CodeBlock
            filename="src/lib/table-v9-features.ts"
            code={framework === 'react' ? featuresSource : svelteFeaturesSource}
          />
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-medium">Migration checklist</h2>
          <ul className="space-y-2 rounded-lg border p-4 text-sm text-muted-foreground">
            {activeChecklist.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden className="text-foreground">
                  □
                </span>
                {item}
              </li>
            ))}
          </ul>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Both @tanstack/react-table v9 and @tanstack/svelte-table v9 ship a
            full migrate-v8-to-v9 guide in their <code>skills</code> folder,
            with the complete list of renames, for anything not covered here.
          </p>
        </div>
      </section>
    </DocsLayout>
  )
}
