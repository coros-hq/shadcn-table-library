import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import columnsSource from './columns.tsx?raw'
import tableSource from './data-table.tsx?raw'
import demoSource from './index.tsx?raw'
import { ReorderableTableDemo } from './index'

const files = [
  { path: 'src/components/reorder/columns.tsx', code: columnsSource },
  { path: 'src/components/reorder/data-table.tsx', code: tableSource },
  { path: 'src/components/reorder/index.tsx', code: demoSource },
]

const steps = [
  {
    title: 'Row order is just a sortable list of ids',
    description:
      "@dnd-kit/sortable doesn't know anything about tables — it only knows about an ordered array of ids and a strategy for laying them out (vertical, in this case). Row order lives directly in the data array itself; dataIds is just that array's ids, recomputed whenever data changes.",
    file: 'src/components/reorder/data-table.tsx',
    code: `const dataIds = useMemo(() => data.map((row) => row.id), [data])`,
  },
  {
    title: 'A drag handle, not the whole row, starts the drag',
    description:
      "useSortable gives back attributes/listeners that must land on the actual draggable element. Spreading them only onto the GripVertical button — not the row itself — keeps clicking a cell's text or a header's sort control working normally; only the handle initiates a drag.",
    file: 'src/components/reorder/data-table.tsx',
    code: `<button
  type="button"
  {...attributes}
  {...listeners}
  aria-label="Reorder row"
>
  <GripVertical className="h-3.5 w-3.5" />
</button>`,
  },
  {
    title: 'Dragging updates real state, not just visual position',
    description:
      "onDragEnd computes the old and new index from the dragged id and calls arrayMove — the same helper dnd-kit ships for this exact case — then calls the parent's onDataChange so the reorder is visible to whoever owns the data, not just the table.",
    file: 'src/components/reorder/data-table.tsx',
    code: `function handleRowDragEnd(event: DragEndEvent) {
  const { active, over } = event
  if (!over || active.id === over.id) return
  const oldIndex = dataIds.indexOf(active.id as string)
  const newIndex = dataIds.indexOf(over.id as string)
  onDataChange(arrayMove(data, oldIndex, newIndex))
}`,
  },
  {
    title: 'DndContext wraps the whole Table, not its header or body',
    description:
      'restrictToVerticalAxis keeps drags from drifting sideways. DndContext has to wrap the entire Table from outside — it renders its own hidden accessibility nodes, and a <table> can only contain <thead>/<tbody>, so nesting a DndContext directly inside one breaks the HTML.',
    file: 'src/components/reorder/data-table.tsx',
    code: `<DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={handleRowDragEnd}>
  <Table>
    <TableHeader>{/* plain, non-draggable headers */}</TableHeader>
    <TableBody>{/* draggable rows */}</TableBody>
  </Table>
</DndContext>`,
  },
  {
    title: 'getRowId keeps identity stable across reorders',
    description:
      "TanStack Table defaults to using array index as a row's id, which breaks the moment you reorder the underlying array — row 2 becomes row 3 and loses its identity. getRowId: (row) => row.id pins each row's identity to its own data, so sorting, selection, and the drag state all keep tracking the right row after a reorder.",
    file: 'src/components/reorder/data-table.tsx',
    code: `const table = useReactTable({
  data,
  columns,
  getRowId: (row) => row.id,
  // ...
})`,
  },
]

export function ReorderableTablePage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Reorderable Table
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Drag rows to reorder them, built on @dnd-kit/sortable rather than
            any table-specific drag logic. Column headers stay put — for
            drag-to-reorder columns, see Resizable / Reorderable Columns.
          </p>
        </div>

        <InstallCommand name="reorderable-table" />

        <ComponentPreview preview={<ReorderableTableDemo />} files={files} />

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
