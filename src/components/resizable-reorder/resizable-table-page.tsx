import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import columnsSource from './columns.tsx?raw'
import tableSource from './data-table.tsx?raw'
import demoSource from './index.tsx?raw'
import { ResizableTableDemo } from './index'

const files = [
  { path: 'src/components/resizable-reorder/columns.tsx', code: columnsSource },
  { path: 'src/components/resizable-reorder/data-table.tsx', code: tableSource },
  { path: 'src/components/resizable-reorder/index.tsx', code: demoSource },
]

const steps = [
  {
    title: 'Resizing is a built-in TanStack Table feature, not custom drag math',
    description:
      "enableColumnResizing plus columnResizeMode: 'onChange' turns on the feature; header.getResizeHandler() returns a ready-made onMouseDown/onTouchStart handler that TanStack wires up to compute the new width itself from the pointer delta. This component only renders the thin edge strip and reads header.getSize() back — no manual pointer-position math.",
    file: 'src/components/resizable-reorder/data-table.tsx',
    code: `const table = useReactTable({
  data,
  columns,
  state: { columnOrder, columnSizing },
  onColumnSizingChange: setColumnSizing,
  columnResizeMode: 'onChange',
  enableColumnResizing: true,
  getCoreRowModel: getCoreRowModel(),
})`,
  },
  {
    title: 'Column reordering reuses the Reorderable Table pattern exactly',
    description:
      "Same horizontal SortableContext + columnOrder state as the earlier Reorderable Table, right down to wrapping the whole <Table> in DndContext from the outside rather than nesting it inside <TableHeader> — DndContext renders hidden accessibility nodes that aren't valid direct children of <table>, which is what broke that example the first time around.",
    file: 'src/components/resizable-reorder/data-table.tsx',
    code: `<DndContext modifiers={[restrictToHorizontalAxis]} onDragEnd={handleDragEnd}>
  <Table style={{ width: table.getTotalSize() }}>
    <TableHeader>{/* ... */}</TableHeader>
    <TableBody>{/* ... */}</TableBody>
  </Table>
</DndContext>`,
  },
  {
    title: 'The resize handle and the drag handle are different elements',
    description:
      "Each header has two separate interactive regions: the GripVertical button (spread with dnd-kit's attributes/listeners) starts a column-reorder drag, and a thin absolutely-positioned strip on the header's right edge (bound to header.getResizeHandler()) starts a resize. Because they're different DOM nodes, grabbing one can never accidentally trigger the other.",
    file: 'src/components/resizable-reorder/data-table.tsx',
    code: `<button {...attributes} {...listeners} aria-label="Reorder column">
  <GripVertical className="h-3.5 w-3.5" />
</button>
{/* ...elsewhere in the same header: */}
<div onMouseDown={header.getResizeHandler()} onTouchStart={header.getResizeHandler()} />`,
  },
  {
    title: 'Layout persists to localStorage, but only after the client hydrates',
    description:
      "columnOrder and columnSizing both start at the same defaults on the server and the first client render, so SSR output matches hydration exactly. A useEffect that only runs in the browser then reads localStorage and swaps in a saved layout — a separate save-effect is guarded by an isHydrated ref so it can't fire and overwrite storage with the defaults before that load has actually happened.",
    file: 'src/components/resizable-reorder/data-table.tsx',
    code: `useEffect(() => {
  const saved = loadLayout()
  if (saved.columnOrder) setColumnOrder(saved.columnOrder)
  if (saved.columnSizing) setColumnSizing(saved.columnSizing)
  isHydrated.current = true
}, [])

useEffect(() => {
  if (!isHydrated.current) return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ columnOrder, columnSizing }))
}, [columnOrder, columnSizing])`,
  },
  {
    title: 'Reset layout clears storage and both pieces of state together',
    description:
      "resetLayout wipes the localStorage key and sets columnOrder/columnSizing back to their defaults in the same function call, so the on-screen table and its persisted copy in localStorage are never briefly out of sync with each other.",
    file: 'src/components/resizable-reorder/data-table.tsx',
    code: `function resetLayout() {
  window.localStorage.removeItem(STORAGE_KEY)
  setColumnOrder(columns.map((c) => c.id as string))
  setColumnSizing({})
}`,
  },
]

export function ResizableTablePage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Resizable / Reorderable Columns
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Drag a header's grip to reorder columns, drag its right edge to
            resize — the resulting layout is saved to localStorage and
            restored on your next visit.
          </p>
        </div>

        <InstallCommand name="resizable-reorderable-columns-table" />

        <ComponentPreview preview={<ResizableTableDemo />} files={files} />

        <div className="space-y-2">
          <p className="text-sm font-medium">How it works</p>
          <div className="divide-y rounded-lg border">
            {steps.map((step, i) => (
              <div key={step.title} className="p-4">
                <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <span className="text-muted-foreground">{i + 1}.</span>
                  {step.title}
                </p>
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
