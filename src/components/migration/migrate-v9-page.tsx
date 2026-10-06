import { Link } from '@tanstack/react-router'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import featuresSource from '#/lib/table-v9-features.ts?raw'

const sections = [
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
]

const renames: Array<[string, string]> = [
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
]

const checklist = [
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
]

export function MigrateV9Page() {
  return (
    <DocsLayout>
      <section className="space-y-10">
        <div>
          <h1 className="text-3xl font-normal tracking-tight sm:text-4xl">
            Migrating from TanStack Table v8 to v9
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground text-balance">
            What changes in your shadcn/ui tables when you move to
            @tanstack/react-table v9, with before and after code taken from the
            examples on this site. Every example here has a v8 and a v9 version,
            so you can compare any page side by side.
          </p>
        </div>

        <div className="space-y-3 rounded-lg border p-4 text-sm">
          <p className="font-medium">The fast path: install the v9 version</p>
          <p className="text-muted-foreground">
            If you have not installed a component yet, skip the migration. Every
            registry item has a v9 twin that adds the right dependency and a
            ready-made features file:
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
        </div>

        <div className="space-y-8">
          {sections.map((section, i) => (
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
                {renames.map(([before, after]) => (
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
            code={featuresSource}
          />
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-medium">Migration checklist</h2>
          <ul className="space-y-2 rounded-lg border p-4 text-sm text-muted-foreground">
            {checklist.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden className="text-foreground">
                  □
                </span>
                {item}
              </li>
            ))}
          </ul>
          <p className="max-w-2xl text-sm text-muted-foreground">
            The @tanstack/react-table v9 package also ships a full
            migrate-v8-to-v9 guide in its <code>skills</code> folder, with the
            complete list of renames, for anything not covered here.
          </p>
        </div>
      </section>
    </DocsLayout>
  )
}
