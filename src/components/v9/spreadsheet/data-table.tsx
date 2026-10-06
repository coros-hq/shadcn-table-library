'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { ClipboardEvent, KeyboardEvent } from 'react'
import { flexRender, useTable } from '@tanstack/react-table-v9'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { cn } from '#/lib/utils.ts'
import { v9Features } from '#/lib/table-v9-features.ts'
import { columns } from './columns'
import { COLS, ROW_COUNT, evaluateSheet } from './formula'
import type { SheetRow } from './columns'

type Pos = { r: number; c: number }

const COL_IDS: readonly string[] = COLS
const COL_COUNT = COLS.length
const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n))
const cellName = (p: Pos) => `${COLS[p.c]}${p.r + 1}`

interface SpreadsheetTableProps {
  initialData: string[][]
}

export function SpreadsheetTable({ initialData }: SpreadsheetTableProps) {
  const [raw, setRaw] = useState(initialData)
  const [active, setActive] = useState<Pos>({ r: 0, c: 0 })
  const [anchor, setAnchor] = useState<Pos>({ r: 0, c: 0 })
  const [editing, setEditingState] = useState<string | null>(null)
  // Mirrors `editing` so a blur fired while the input unmounts can't commit twice
  const editingRef = useRef<string | null>(null)
  const dragging = useRef(false)
  const gridRef = useRef<HTMLDivElement>(null)

  const computed = useMemo(() => evaluateSheet(raw), [raw])
  const rows = useMemo<SheetRow[]>(
    () => computed.map((cells, r) => ({ n: r + 1, cells })),
    [computed],
  )

  const table = useTable({
    features: v9Features,
    data: rows,
    columns,
    // v9Features registers pagination, which would cap the sheet at 10 rows
    manualPagination: true,
  })

  const range = {
    r1: Math.min(anchor.r, active.r),
    r2: Math.max(anchor.r, active.r),
    c1: Math.min(anchor.c, active.c),
    c2: Math.max(anchor.c, active.c),
  }
  const inRange = (r: number, c: number) =>
    r >= range.r1 && r <= range.r2 && c >= range.c1 && c <= range.c2

  useEffect(() => {
    const stop = () => {
      dragging.current = false
    }
    window.addEventListener('mouseup', stop)
    return () => window.removeEventListener('mouseup', stop)
  }, [])

  useEffect(() => {
    gridRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [active])

  function setEditing(value: string | null) {
    editingRef.current = value
    setEditingState(value)
  }

  function select(pos: Pos, extend = false) {
    setActive(pos)
    if (!extend) setAnchor(pos)
  }

  function moveBy(dr: number, dc: number, extend = false) {
    select(
      {
        r: clamp(active.r + dr, 0, ROW_COUNT - 1),
        c: clamp(active.c + dc, 0, COL_COUNT - 1),
      },
      extend,
    )
  }

  function writeCells(updates: Array<[Pos, string]>) {
    setRaw((prev) => {
      const next = prev.map((row) => [...row])
      for (const [pos, value] of updates) next[pos.r][pos.c] = value
      return next
    })
  }

  function commit(move?: Pos, refocus = true) {
    const draft = editingRef.current
    if (draft === null) return
    writeCells([[active, draft]])
    setEditing(null)
    if (move) moveBy(move.r, move.c)
    if (refocus) gridRef.current?.focus()
  }

  function cancelEdit() {
    setEditing(null)
    gridRef.current?.focus()
  }

  function startEdit(initial?: string) {
    setEditing(initial ?? raw[active.r][active.c])
  }

  function clearRange() {
    const updates: Array<[Pos, string]> = []
    for (let r = range.r1; r <= range.r2; r++) {
      for (let c = range.c1; c <= range.c2; c++) updates.push([{ r, c }, ''])
    }
    writeCells(updates)
  }

  function onGridKeyDown(e: KeyboardEvent) {
    if (editing !== null) return
    const mod = e.metaKey || e.ctrlKey
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        return moveBy(-1, 0, e.shiftKey)
      case 'ArrowDown':
        e.preventDefault()
        return moveBy(1, 0, e.shiftKey)
      case 'ArrowLeft':
        e.preventDefault()
        return moveBy(0, -1, e.shiftKey)
      case 'ArrowRight':
        e.preventDefault()
        return moveBy(0, 1, e.shiftKey)
      case 'Tab':
        e.preventDefault()
        return moveBy(0, e.shiftKey ? -1 : 1)
      case 'Enter':
      case 'F2':
        e.preventDefault()
        return startEdit()
      case 'Delete':
      case 'Backspace':
        e.preventDefault()
        return clearRange()
    }
    if (mod && e.key.toLowerCase() === 'a') {
      e.preventDefault()
      setAnchor({ r: ROW_COUNT - 1, c: COL_COUNT - 1 })
      setActive({ r: 0, c: 0 })
    } else if (!mod && !e.altKey && e.key.length === 1) {
      // Typing over a cell replaces its content, like a spreadsheet
      e.preventDefault()
      startEdit(e.key)
    }
  }

  function onInputKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    // Keep typing and caret keys away from the grid's navigation handler
    e.stopPropagation()
    if (e.key === 'Enter') {
      e.preventDefault()
      commit({ r: e.shiftKey ? -1 : 1, c: 0 })
    } else if (e.key === 'Tab') {
      e.preventDefault()
      commit({ r: 0, c: e.shiftKey ? -1 : 1 })
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancelEdit()
    }
  }

  function onCopy(e: ClipboardEvent) {
    if (editing !== null) return
    e.preventDefault()
    const lines: string[] = []
    for (let r = range.r1; r <= range.r2; r++) {
      const cells: string[] = []
      for (let c = range.c1; c <= range.c2; c++) cells.push(computed[r][c].text)
      lines.push(cells.join('\t'))
    }
    e.clipboardData.setData('text/plain', lines.join('\n'))
  }

  function onPaste(e: ClipboardEvent) {
    if (editing !== null) return
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain').replace(/\r/g, '')
    const pasted = text
      .replace(/\n$/, '')
      .split('\n')
      .map((l) => l.split('\t'))
    const updates: Array<[Pos, string]> = []
    let last: Pos = { r: range.r1, c: range.c1 }
    pasted.forEach((line, i) =>
      line.forEach((value, j) => {
        const pos = { r: range.r1 + i, c: range.c1 + j }
        if (pos.r >= ROW_COUNT || pos.c >= COL_COUNT) return
        updates.push([pos, value])
        last = pos
      }),
    )
    writeCells(updates)
    setAnchor({ r: range.r1, c: range.c1 })
    setActive(last)
  }

  function onCellMouseDown(e: React.MouseEvent, pos: Pos) {
    if (e.button !== 0) return
    const insideEditor =
      editingRef.current !== null && pos.r === active.r && pos.c === active.c
    if (insideEditor) return
    commit(undefined, false)
    select(pos, e.shiftKey)
    dragging.current = true
  }

  const numbers: number[] = []
  for (let r = range.r1; r <= range.r2; r++) {
    for (let c = range.c1; c <= range.c2; c++) {
      const value = computed[r][c].value
      if (value !== null) numbers.push(value)
    }
  }
  const multiple = range.r1 !== range.r2 || range.c1 !== range.c2
  const total = numbers.reduce((sum, n) => sum + n, 0)
  const fmt = (n: number) => String(Math.round(n * 1e4) / 1e4)

  return (
    <div>
      <div className="mb-2 flex items-center overflow-hidden rounded-md border text-sm">
        <div className="w-16 shrink-0 border-r bg-muted/50 px-2 py-1.5 text-center font-medium">
          {cellName(active)}
        </div>
        <div
          className="min-w-0 flex-1 truncate px-3 py-1.5 font-mono text-xs"
          aria-label="Cell contents"
        >
          {editing ?? raw[active.r][active.c]}
        </div>
      </div>

      <div
        ref={gridRef}
        tabIndex={0}
        aria-label="Spreadsheet. Arrow keys move, Enter edits, Shift extends the selection."
        onKeyDown={onGridKeyDown}
        onCopy={onCopy}
        onPaste={onPaste}
        className="max-h-96 overflow-auto rounded-md border outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/50 [&_[data-slot=table-container]]:overflow-visible"
      >
        <Table className="min-w-xl table-fixed border-separate border-spacing-0">
          <TableHeader className="sticky top-0 z-20 [&_tr]:border-b-0">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  const c = COL_IDS.indexOf(header.column.id)
                  const highlighted = c >= 0 && c >= range.c1 && c <= range.c2
                  return (
                    <TableHead
                      key={header.id}
                      onMouseDown={() => {
                        if (c < 0) return
                        commit(undefined, false)
                        setAnchor({ r: ROW_COUNT - 1, c })
                        setActive({ r: 0, c })
                      }}
                      className={cn(
                        'h-8 border-r border-b bg-muted text-center text-xs font-medium',
                        c < 0
                          ? 'sticky left-0 z-30 w-12'
                          : 'cursor-pointer text-muted-foreground',
                        highlighted && 'bg-accent text-foreground',
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="hover:bg-transparent">
                {row.getVisibleCells().map((cell) => {
                  const c = COL_IDS.indexOf(cell.column.id)
                  const r = row.index

                  if (c < 0) {
                    const highlighted = r >= range.r1 && r <= range.r2
                    return (
                      <TableCell
                        key={cell.id}
                        onMouseDown={() => {
                          commit(undefined, false)
                          setAnchor({ r, c: COL_COUNT - 1 })
                          setActive({ r, c: 0 })
                        }}
                        className={cn(
                          'sticky left-0 z-10 h-8 cursor-pointer border-r border-b bg-muted p-0 text-center text-xs text-muted-foreground',
                          highlighted && 'bg-accent text-foreground',
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    )
                  }

                  const view = row.original.cells[c]
                  const isActive = active.r === r && active.c === c
                  return (
                    <TableCell
                      key={cell.id}
                      data-active={isActive}
                      onMouseDown={(e) => onCellMouseDown(e, { r, c })}
                      onMouseEnter={() => {
                        if (dragging.current) setActive({ r, c })
                      }}
                      onDoubleClick={() => startEdit()}
                      className={cn(
                        'relative h-8 scroll-ml-12 scroll-mt-8 truncate border-r border-b px-2 py-0',
                        view.kind === 'number' && 'text-right tabular-nums',
                        view.kind === 'error' &&
                          'text-red-600 dark:text-red-400',
                        inRange(r, c) && 'bg-primary/10',
                        isActive &&
                          'outline-2 -outline-offset-2 outline-primary',
                      )}
                    >
                      {isActive && editing !== null ? (
                        <input
                          autoFocus
                          value={editing}
                          aria-label={`Edit ${cellName({ r, c })}`}
                          onChange={(e) => setEditing(e.target.value)}
                          onKeyDown={onInputKeyDown}
                          onBlur={() => commit(undefined, false)}
                          className="absolute inset-0 size-full bg-background px-2 text-sm outline-2 -outline-offset-2 outline-primary select-text"
                        />
                      ) : (
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )
                      )}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p
        className="mt-3 text-xs text-muted-foreground tabular-nums"
        aria-live="polite"
      >
        {multiple && numbers.length > 0
          ? `Sum ${fmt(total)} · Average ${fmt(total / numbers.length)} · Count ${numbers.length}`
          : 'Type to edit · Enter or F2 edits · Shift + arrows select · Copy and paste work'}
      </p>
    </div>
  )
}
