import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import columnsSource from './columns.tsx?raw'
import tableSource from './data-table.tsx?raw'
import demoSource from './index.tsx?raw'
import { TreeReorderDemo } from './index'

const files = [
  { path: 'src/components/tree-reorder/columns.tsx', code: columnsSource },
  { path: 'src/components/tree-reorder/data-table.tsx', code: tableSource },
  { path: 'src/components/tree-reorder/index.tsx', code: demoSource },
]

const steps = [
  {
    title: "A flat drag list, built from the tree's own flattened rows",
    description:
      "@dnd-kit/sortable only understands a flat, ordered list of ids — it has no idea rows are nested. table.getRowModel().rows is already flattened in document order (that's how the tree renders in the first place), so that same list doubles as the SortableContext's items without any extra bookkeeping.",
    file: 'src/components/tree-reorder/data-table.tsx',
    code: `const rowIds = useMemo(
  () => table.getRowModel().rows.map((row) => row.id),
  [table, data, expanded],
)`,
  },
  {
    title: 'Reordering is scoped to siblings, on purpose',
    description:
      "Drag-and-drop only knows positions in a flat list, but reparenting a node (moving an employee into a different team) is a much bigger decision than reordering it — this example intentionally only supports the latter. reorderSiblings walks the tree looking for the array that contains both the dragged id and the drop target's id; it only reorders when they're found in the same array.",
    file: 'src/components/tree-reorder/data-table.tsx',
    code: `function reorderSiblings(nodes, activeId, overId) {
  const oldIndex = nodes.findIndex((n) => n.id === activeId)
  const newIndex = nodes.findIndex((n) => n.id === overId)
  if (oldIndex !== -1 && newIndex !== -1) {
    return { nodes: arrayMove(nodes, oldIndex, newIndex), moved: true }
  }
  // ...recurse into each node's children looking for a shared parent
}`,
  },
  {
    title: "Dragging onto a different branch is a silent no-op",
    description:
      "Drag Ava Thompson from Frontend and hover over a row inside Design — reorderSiblings never finds an array containing both ids, so moved stays false and onDataChange is never called. The row animates back to its original position because the underlying data, and therefore its position in rowIds, never changed.",
    file: 'src/components/tree-reorder/data-table.tsx',
    code: `function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event
  if (!over || active.id === over.id) return
  const result = reorderSiblings(data, active.id as string, over.id as string)
  if (result.moved) onDataChange(result.nodes)
}`,
  },
  {
    title: 'A drag handle starts the drag, not the row itself',
    description:
      'useSortable’s attributes/listeners are spread only onto the GripVertical button in the first cell, not the row or the expand toggle — so clicking a row’s expand chevron still just expands it, and only grabbing the handle picks the row up.',
    file: 'src/components/tree-reorder/data-table.tsx',
    code: `<button type="button" {...attributes} {...listeners} aria-label="Reorder row">
  <GripVertical className="h-3.5 w-3.5" />
</button>`,
  },
  {
    title: 'Search, sort, and pagination are left out here too',
    description:
      "Same reasoning as the base Tree Table's pagination: any feature that reorders or hides rows out from under the drag list (sorting, filtering, paginating) would fight with rowIds mid-drag. This example only composes expansion and sibling-scoped reordering, kept deliberately minimal so the drag mechanics stay legible.",
    file: 'src/components/tree-reorder/data-table.tsx',
    code: `const table = useReactTable({
  data,
  columns,
  getRowId: (row) => row.id,
  getSubRows: (row) => row.children,
  getExpandedRowModel: getExpandedRowModel(),
  // no getSortedRowModel / getFilteredRowModel / getPaginationRowModel
})`,
  },
]

export function TreeReorderPage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Tree Table — Reorder
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The same department/team/employee tree, with rows draggable by a
            handle — reordering is scoped to siblings within the same parent,
            so a department can't accidentally get dropped inside a team.
          </p>
        </div>

        <InstallCommand name="tree-table-reorder" />

        <ComponentPreview preview={<TreeReorderDemo />} files={files} />

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
