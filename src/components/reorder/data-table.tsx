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
import {
  restrictToHorizontalAxis,
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers'
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type {
  Cell,
  ColumnDef,
  Header,
  Row,
  SortingState,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown, GripVertical } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'

interface ReorderableTableProps<TData extends { id: string }> {
  columns: ColumnDef<TData, any>[]
  data: TData[]
  onDataChange: (data: TData[]) => void
}

function DraggableTableHeader<TData>({
  header,
}: {
  header: Header<TData, unknown>
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: header.column.id })
  const canSort = header.column.getCanSort()

  return (
    <TableHead
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
      }}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab text-muted-foreground active:cursor-grabbing"
          aria-label="Reorder column"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
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
            : flexRender(header.column.columnDef.header, header.getContext())}
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
      </div>
    </TableHead>
  )
}

function DraggableRow<TData extends { id: string }>({
  row,
}: {
  row: Row<TData>
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
      {row.getVisibleCells().map((cell: Cell<TData, unknown>) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function ReorderableTable<TData extends { id: string }>({
  columns,
  data,
  onDataChange,
}: ReorderableTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    columns.map((c) => c.id as string),
  )

  const dataIds = useMemo(() => data.map((row) => row.id), [data])

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnOrderChange: setColumnOrder,
    state: { sorting, columnOrder },
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function handleColumnDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setColumnOrder((prev) => {
      const oldIndex = prev.indexOf(active.id as string)
      const newIndex = prev.indexOf(over.id as string)
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

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
        modifiers={[restrictToHorizontalAxis]}
        onDragEnd={handleColumnDragEnd}
      >
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
                  <SortableContext
                    items={columnOrder}
                    strategy={horizontalListSortingStrategy}
                  >
                    {headerGroup.headers.map((header) => (
                      <DraggableTableHeader key={header.id} header={header} />
                    ))}
                  </SortableContext>
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
      </DndContext>
    </div>
  )
}
