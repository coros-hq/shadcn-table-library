import type { KeyboardEvent } from 'react'
import type { ColumnDef, Table } from '@tanstack/react-table'

import { cn } from '#/lib/utils'
import { covered, days, required, shiftById } from './data'
import type { Assignment, Person, Schedule } from './data'
import { MIN_REST, cellKey, coverage, load, restBefore } from './schedule'
import { ShiftCell, ShiftChip } from './shift-cell'

export interface ScheduleMeta {
  schedule: Schedule
  /** Cell keys that differ from the published schedule */
  changed: Set<string>
  /** The cell that's in the tab order */
  active: string
  assign: (personId: string, day: number, value: Assignment) => void
  /** Arrow keys, letters and Delete on a cell; handled by the table */
  onCellKeyDown: (
    event: KeyboardEvent<HTMLButtonElement>,
    personId: string,
    day: number,
  ) => void
}

const getMeta = (table: Table<Person>) =>
  table.options.meta as unknown as ScheduleMeta

export const columns: ColumnDef<Person>[] = [
  {
    id: 'person',
    header: 'Staff',
    cell: ({ row }) => (
      <div className="flex min-w-0 flex-col">
        <span className="truncate font-medium">{row.original.name}</span>
        <span className="truncate text-xs text-muted-foreground">
          {row.original.role}
        </span>
      </div>
    ),
    footer: () => (
      <div className="flex flex-col text-xs">
        <span className="font-medium">On shift</span>
        <span className="text-muted-foreground">of needed</span>
      </div>
    ),
  },
  ...days.map((d, day): ColumnDef<Person> => ({
    id: d.id,
    header: () => (
      <div className="flex flex-col items-center leading-tight">
        <span>{d.short}</span>
        <span className="text-xs font-normal text-muted-foreground tabular-nums">
          {d.date}
        </span>
      </div>
    ),
    cell: ({ row, table }) => {
      const meta = getMeta(table)
      const person = row.original
      const week = meta.schedule[person.id]
      const rest = restBefore(week, day)
      const key = cellKey(person.id, day)
      return (
        <ShiftCell
          cellKey={key}
          value={week[day]}
          label={`${person.name}, ${d.short} ${d.date}`}
          changed={meta.changed.has(key)}
          rest={rest !== null && rest < MIN_REST ? rest : null}
          tabbable={meta.active === key}
          onAssign={(value) => meta.assign(person.id, day, value)}
          onKeyDown={(event) => meta.onCellKeyDown(event, person.id, day)}
        />
      )
    },
    footer: ({ table }) => {
      const have = coverage(getMeta(table).schedule, day)
      const need = required(d)
      return (
        <ul className="flex flex-col items-center gap-0.5 text-xs tabular-nums">
          {covered.map((shift) => {
            const short = have[shift] < need[shift]
            return (
              <li
                key={shift}
                className={cn(
                  'flex items-center gap-1',
                  short && 'font-semibold text-destructive',
                )}
              >
                <ShiftChip shift={shift} className="size-4 text-[10px]" />
                <span className="sr-only">{shiftById[shift].label}:</span>
                {have[shift]}/{need[shift]}
                {short ? <span className="sr-only">(short)</span> : null}
              </li>
            )
          })}
        </ul>
      )
    },
  })),
  {
    id: 'hours',
    header: () => <span className="block text-right">Hours</span>,
    cell: ({ row, table }) => {
      const person = row.original
      const { hours, diff, status } = load(
        person,
        getMeta(table).schedule[person.id],
      )
      return (
        <div className="flex min-w-20 flex-col items-end gap-1">
          <span className="text-sm tabular-nums">
            {hours}
            <span className="text-muted-foreground"> / {person.contract}h</span>
          </span>
          <span
            className={cn(
              'text-xs tabular-nums',
              status === 'over'
                ? 'font-medium text-amber-700 dark:text-amber-400'
                : 'text-muted-foreground',
            )}
          >
            {status === 'exact'
              ? 'On contract'
              : status === 'over'
                ? `${diff}h over`
                : `${-diff}h free`}
          </span>
        </div>
      )
    },
  },
]
