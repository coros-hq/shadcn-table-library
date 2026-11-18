import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { cn } from '#/lib/utils'
import { columns } from './columns'
import type { ScheduleMeta } from './columns'
import { days, people } from './data'
import type { Assignment, Schedule } from './data'
import { cellKey, fromKey } from './schedule'

const isDay = (id: string) => days.some((d) => d.id === id)
const weekend = (id: string) => days.find((d) => d.id === id)?.weekend

export function ScheduleTable({
  schedule,
  changed,
  assign,
}: {
  schedule: Schedule
  changed: Set<string>
  assign: (personId: string, day: number, value: Assignment) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(cellKey(people[0].id, 0))

  function focusCell(row: number, day: number) {
    const r = Math.max(0, Math.min(people.length - 1, row))
    const d = Math.max(0, Math.min(days.length - 1, day))
    const key = cellKey(people[r].id, d)
    setActive(key)
    ref.current?.querySelector<HTMLElement>(`[data-cell="${key}"]`)?.focus()
  }

  function onCellKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    personId: string,
    day: number,
  ) {
    if (event.metaKey || event.ctrlKey || event.altKey) return
    const row = people.findIndex((p) => p.id === personId)
    const move: Record<string, [number, number]> = {
      ArrowUp: [row - 1, day],
      ArrowDown: [row + 1, day],
      ArrowLeft: [row, day - 1],
      ArrowRight: [row, day + 1],
      Home: [row, 0],
      End: [row, days.length - 1],
    }
    if (event.key in move) {
      event.preventDefault()
      focusCell(...move[event.key])
      return
    }
    const value = fromKey(event.key)
    if (value === undefined) return
    event.preventDefault()
    assign(personId, day, value)
    // Typing a shift moves on to the next day, so a week fills in one go
    if (value !== null) focusCell(row, day + 1)
  }

  const meta: ScheduleMeta = {
    schedule,
    changed,
    active,
    assign,
    onCellKeyDown,
  }

  const table = useReactTable({
    data: people,
    columns,
    getRowId: (person) => person.id,
    getCoreRowModel: getCoreRowModel(),
    meta,
  })

  const sticky = 'sticky left-0 z-10 bg-background'

  return (
    <div
      ref={ref}
      // Whichever cell gets focus, by click or by Tab, becomes the tab stop
      onFocus={(event) => {
        const key = (event.target as HTMLElement).dataset.cell
        if (key) setActive(key)
      }}
      className="overflow-x-auto rounded-md border"
    >
      <Table className="min-w-[760px] table-fixed">
        <colgroup>
          <col className="w-32 sm:w-48" />
          {days.map((d) => (
            <col key={d.id} />
          ))}
          <col className="w-28" />
        </colgroup>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id} className="hover:bg-transparent">
              {group.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cn(
                    'h-auto py-2',
                    header.column.id === 'person' && sticky,
                    isDay(header.column.id) && 'text-center',
                    weekend(header.column.id) && 'bg-muted/50',
                  )}
                >
                  {flexRender(
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
            <TableRow key={row.id} className="hover:bg-transparent">
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={cn(
                    isDay(cell.column.id) ? 'p-1' : 'py-1.5',
                    cell.column.id === 'person' && sticky,
                    weekend(cell.column.id) && 'bg-muted/50',
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
        <TableFooter className="bg-transparent">
          {table
            .getFooterGroups()
            .slice(0, 1)
            .map((group) => (
              <TableRow key={group.id} className="hover:bg-transparent">
                {group.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    className={cn(
                      'py-2 align-top',
                      header.column.id === 'person' && sticky,
                      weekend(header.column.id) && 'bg-muted/50',
                    )}
                  >
                    {flexRender(
                      header.column.columnDef.footer,
                      header.getContext(),
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
        </TableFooter>
      </Table>
    </div>
  )
}
