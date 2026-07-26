'use client'

import { useEffect, useRef, useState } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers'
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef, Header } from '@tanstack/react-table'
import { GripVertical } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils.ts'

const STORAGE_KEY = 'resizable-table-layout'

interface StoredLayout {
  columnOrder?: string[]
  columnSizing?: Record<string, number>
}

function loadLayout(): StoredLayout {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

interface ResizableTableProps<TData> {
  columns: ColumnDef<TData, any>[]
  data: TData[]
}

function DraggableResizableHeader<TData>({
  header,
}: {
  header: Header<TData, unknown>
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: header.column.id })

  return (
    <TableHead
      ref={setNodeRef}
      style={{
        width: header.getSize(),
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        position: 'relative',
      }}
      className="select-none"
    >
      <div className="flex items-center gap-1.5 pr-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab text-muted-foreground active:cursor-grabbing"
          aria-label="Reorder column"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <span>
          {flexRender(header.column.columnDef.header, header.getContext())}
        </span>
      </div>
      <div
        onMouseDown={header.getResizeHandler()}
        onTouchStart={header.getResizeHandler()}
        className={cn(
          'absolute top-0 right-0 h-full w-1 cursor-col-resize touch-none bg-border opacity-0 select-none hover:opacity-100',
          header.column.getIsResizing() && 'bg-primary opacity-100',
        )}
      />
    </TableHead>
  )
}

export function ResizableTable<TData>({ columns, data }: ResizableTableProps<TData>) {
  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    columns.map((c) => c.id as string),
  )
  const [columnSizing, setColumnSizing] = useState<Record<string, number>>({})
  const isHydrated = useRef(false)

  useEffect(() => {
    const saved = loadLayout()
    if (saved.columnOrder) setColumnOrder(saved.columnOrder)
    if (saved.columnSizing) setColumnSizing(saved.columnSizing)
    isHydrated.current = true
  }, [])

  useEffect(() => {
    if (!isHydrated.current) return
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ columnOrder, columnSizing }),
    )
  }, [columnOrder, columnSizing])

  const table = useReactTable({
    data,
    columns,
    state: { columnOrder, columnSizing },
    onColumnOrderChange: setColumnOrder,
    onColumnSizingChange: setColumnSizing,
    columnResizeMode: 'onChange',
    enableColumnResizing: true,
    getCoreRowModel: getCoreRowModel(),
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setColumnOrder((prev) => {
      const oldIndex = prev.indexOf(active.id as string)
      const newIndex = prev.indexOf(over.id as string)
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  function resetLayout() {
    window.localStorage.removeItem(STORAGE_KEY)
    setColumnOrder(columns.map((c) => c.id as string))
    setColumnSizing({})
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Drag a header's grip to reorder, drag its right edge to resize.
        </p>
        <Button type="button" variant="outline" size="sm" onClick={resetLayout}>
          Reset layout
        </Button>
      </div>
      <div className="overflow-x-auto rounded-md border">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToHorizontalAxis]}
          onDragEnd={handleDragEnd}
        >
          <Table style={{ width: table.getTotalSize() }}>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  <SortableContext
                    items={columnOrder}
                    strategy={horizontalListSortingStrategy}
                  >
                    {headerGroup.headers.map((header) => (
                      <DraggableResizableHeader key={header.id} header={header} />
                    ))}
                  </SortableContext>
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DndContext>
      </div>
    </div>
  )
}
