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
  useTable,
} from '@tanstack/react-table-v9'
import type { Cell, ColumnDef, Row, SortingState, RowData} from '@tanstack/react-table-v9'
import { ArrowDown, ArrowUp, ArrowUpDown, GripVertical } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { v9Features, type V9Features } from '#/lib/table-v9-features.ts'

interface ReorderableTableProps<TData extends RowData & { id: string }> {
  columns: ColumnDef<V9Features, TData, any>[]
  data: TData[]
  onDataChange: (data: TData[]) => void
}

function DraggableRow<TData extends RowData & { id: string }>({
  row,
}: {
  row: Row<V9Features, TData>
}) {
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
      {row.getVisibleCells().map((cell: Cell<V9Features, TData, unknown>) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function ReorderableTable<TData extends RowData & { id: string }>({
  columns,
  data,
  onDataChange,
}: ReorderableTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])

  const dataIds = useMemo(() => data.map((row) => row.id), [data])

  const table = useTable({
    features: v9Features,
    data,
    columns,
    getRowId: (row) => row.id,
    onSortingChange: setSorting,
    state: { sorting },
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function handleRowDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = dataIds.indexOf(active.id as string)
    const newIndex = dataIds.indexOf(over.id as string)
    onDataChange(arrayMove(data, oldIndex, newIndex))
  }

  return (
    <div className="overflow-hidden rounded-md border">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleRowDragEnd}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                <TableHead className="w-8" />
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  return (
                    <TableHead key={header.id}>
                      <span
                        onClick={header.column.getToggleSortingHandler()}
                        className={
                          canSort
                            ? 'flex cursor-pointer select-none items-center gap-2'
                            : 'flex items-center gap-2'
                        }
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                        {canSort ? (
                          header.column.getIsSorted() === 'asc' ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : header.column.getIsSorted() === 'desc' ? (
                            <ArrowDown className="h-3 w-3" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-50" />
                          )
                        ) : null}
                      </span>
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              <SortableContext
                items={dataIds}
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
