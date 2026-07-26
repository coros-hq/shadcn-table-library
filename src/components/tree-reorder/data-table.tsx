'use client'

import { useMemo, useState } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { Cell, ColumnDef, ExpandedState, Row } from '@tanstack/react-table'
import { GripVertical } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'

type TreeNode = { id: string; children?: TreeNode[] }

function reorderSiblings<TData extends TreeNode>(
  nodes: TData[],
  activeId: string,
  overId: string,
): { nodes: TData[]; moved: boolean } {
  const oldIndex = nodes.findIndex((n) => n.id === activeId)
  const newIndex = nodes.findIndex((n) => n.id === overId)

  if (oldIndex !== -1 && newIndex !== -1) {
    return { nodes: arrayMove(nodes, oldIndex, newIndex), moved: true }
  }

  let moved = false
  const next = nodes.map((node) => {
    if (!node.children) return node
    const result = reorderSiblings(node.children as TData[], activeId, overId)
    if (result.moved) moved = true
    return result.moved ? { ...node, children: result.nodes } : node
  })

  return { nodes: moved ? next : nodes, moved }
}

interface TreeReorderDataTableProps<TData extends TreeNode> {
  columns: ColumnDef<TData, any>[]
  data: TData[]
  onDataChange: (data: TData[]) => void
}

function DraggableRow<TData extends TreeNode>({ row }: { row: Row<TData> }) {
  const { transform, transition, setNodeRef, isDragging, attributes, listeners } =
    useSortable({ id: row.original.id })

  return (
    <TableRow
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        position: 'relative',
        zIndex: isDragging ? 1 : 0,
      }}
    >
      <TableCell className="w-8">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab text-muted-foreground active:cursor-grabbing"
          aria-label="Reorder row"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
      </TableCell>
      {row.getVisibleCells().map((cell: Cell<TData, unknown>) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function TreeReorderDataTable<TData extends TreeNode>({
  columns,
  data,
  onDataChange,
}: TreeReorderDataTableProps<TData>) {
  const [expanded, setExpanded] = useState<ExpandedState>(true)

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getSubRows: (row) => row.children,
    getExpandedRowModel: getExpandedRowModel(),
    onExpandedChange: setExpanded,
    state: { expanded },
  })

  const rowIds = useMemo(
    () => table.getRowModel().rows.map((row) => row.id),
    [table, data, expanded],
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const result = reorderSiblings(data, active.id as string, over.id as string)
    if (result.moved) onDataChange(result.nodes)
  }

  return (
    <div className="overflow-hidden rounded-md border">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                <TableHead className="w-8" />
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              <SortableContext
                items={rowIds}
                strategy={verticalListSortingStrategy}
              >
                {table.getRowModel().rows.map((row) => (
                  <DraggableRow key={row.id} row={row} />
                ))}
              </SortableContext>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </DndContext>
    </div>
  )
}
