'use client'

import { useMemo, useRef, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { Undo2 } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { cn } from '#/lib/utils.ts'
import type { FieldConfig, Product } from './columns'
import { editableFields } from './columns'

interface HistoryEntry {
  rowId: string
  columnId: string
  previousValue: string | number
}

const currency = (value: number) =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

function cellKey(rowId: string, columnId: string) {
  return `${rowId}:${columnId}`
}

interface EditableTableProps {
  data: Product[]
  onDataChange: (updater: (prev: Product[]) => Product[]) => void
}

export function EditableTable({ data, onDataChange }: EditableTableProps) {
  const [editingCell, setEditingCell] = useState<{
    rowId: string
    columnId: string
  } | null>(null)
  const [draftValue, setDraftValue] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pendingCells, setPendingCells] = useState<Set<string>>(new Set())
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const errorTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  function startEdit(rowId: string, columnId: string, currentValue: string | number) {
    setEditingCell({ rowId, columnId })
    setDraftValue(String(currentValue))
  }

  function cancelEdit() {
    setEditingCell(null)
  }

  function flashError(key: string, message: string) {
    setErrors((prev) => ({ ...prev, [key]: message }))
    clearTimeout(errorTimers.current[key])
    errorTimers.current[key] = setTimeout(() => {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }, 2000)
  }

  function saveOptimistically(
    rowId: string,
    columnId: string,
    previousValue: string | number,
    key: string,
  ) {
    setPendingCells((prev) => new Set(prev).add(key))
    setTimeout(() => {
      const failed = Math.random() < 0.15
      setPendingCells((prev) => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
      if (failed) {
        onDataChange((prev) =>
          prev.map((r) =>
            r.id === rowId ? { ...r, [columnId]: previousValue } : r,
          ),
        )
        setHistory((prev) => {
          const fromEnd = [...prev]
            .reverse()
            .findIndex((h) => h.rowId === rowId && h.columnId === columnId)
          if (fromEnd === -1) return prev
          const index = prev.length - 1 - fromEnd
          return prev.filter((_, i) => i !== index)
        })
        flashError(key, 'Save failed — reverted')
      }
    }, 600)
  }

  function commitEdit(field: FieldConfig) {
    if (!editingCell) return
    const { rowId, columnId } = editingCell
    const key = cellKey(rowId, columnId)
    const error = field.validate(draftValue)

    if (error) {
      flashError(key, error)
      setEditingCell(null)
      return
    }

    const parsedValue = field.type === 'number' ? Number(draftValue) : draftValue
    const row = data.find((r) => r.id === rowId)
    setEditingCell(null)
    if (!row) return

    const previousValue = row[columnId as keyof Product] as string | number
    if (previousValue === parsedValue) return

    onDataChange((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, [columnId]: parsedValue } : r)),
    )
    setHistory((prev) => [...prev, { rowId, columnId, previousValue }])
    saveOptimistically(rowId, columnId, previousValue, key)
  }

  function undo() {
    setHistory((prev) => {
      if (prev.length === 0) return prev
      const last = prev[prev.length - 1]
      onDataChange((data) =>
        data.map((r) =>
          r.id === last.rowId ? { ...r, [last.columnId]: last.previousValue } : r,
        ),
      )
      return prev.slice(0, -1)
    })
  }

  const columns = useMemo<ColumnDef<Product>[]>(() => {
    const editable: ColumnDef<Product>[] = editableFields.map((field) => ({
      id: field.id,
      header: field.label,
      accessorKey: field.id,
      cell: ({ row, getValue }) => {
        const key = cellKey(row.original.id, field.id)
        const isEditing =
          editingCell?.rowId === row.original.id &&
          editingCell.columnId === field.id
        const isPending = pendingCells.has(key)
        const error = errors[key]
        const value = getValue() as string | number

        if (isEditing) {
          return (
            <Input
              autoFocus
              value={draftValue}
              type={field.type === 'number' ? 'number' : 'text'}
              onChange={(e) => setDraftValue(e.target.value)}
              onBlur={() => commitEdit(field)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitEdit(field)
                if (e.key === 'Escape') cancelEdit()
              }}
              className="h-7 px-2"
            />
          )
        }

        return (
          <button
            type="button"
            onClick={() => startEdit(row.original.id, field.id, value)}
            className={cn(
              'w-full rounded px-1.5 py-1 text-left hover:bg-muted',
              isPending && 'opacity-50',
              error && 'text-destructive',
            )}
          >
            {error ?? (field.id === 'price' ? currency(value as number) : value)}
          </button>
        )
      },
    }))

    return [
      { accessorKey: 'id', header: 'SKU' },
      ...editable,
      { accessorKey: 'category', header: 'Category' },
    ]
  }, [editingCell, draftValue, errors, pendingCells])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Click a Name, Price, or Stock cell to edit it.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={undo}
          disabled={history.length === 0}
        >
          <Undo2 className="h-3.5 w-3.5" />
          Undo{history.length > 0 ? ` (${history.length})` : ''}
        </Button>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
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
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
