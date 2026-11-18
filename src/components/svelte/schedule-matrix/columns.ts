import type { ColumnDef, Table } from '@tanstack/table-core'
import { renderComponent } from '$lib/components/ui/data-table/index.js'
import Coverage from './Coverage.svelte'
import DayHeader from './DayHeader.svelte'
import HoursCell from './HoursCell.svelte'
import PersonCell from './PersonCell.svelte'
import RightLabel from './RightLabel.svelte'
import ShiftCell from './ShiftCell.svelte'
import { days, required } from './data'
import type { Assignment, Person, Schedule } from './data'
import { MIN_REST, cellKey, coverage, load, restBefore } from './schedule'

export interface ScheduleMeta {
  schedule: Schedule
  /** Cell keys that differ from the published schedule */
  changed: Set<string>
  /** The cell that's in the tab order */
  active: string
  assign: (personId: string, day: number, value: Assignment) => void
  /** Arrow keys, letters and Delete on a cell; handled by the table */
  onCellKeydown: (event: KeyboardEvent, personId: string, day: number) => void
}

const getMeta = (table: Table<Person>) =>
  table.options.meta as unknown as ScheduleMeta

export const columns: ColumnDef<Person>[] = [
  {
    id: 'person',
    header: 'Staff',
    cell: ({ row }) =>
      renderComponent(PersonCell, {
        title: row.original.name,
        subtitle: row.original.role,
      }),
    footer: () =>
      renderComponent(PersonCell, { title: 'On shift', subtitle: 'of needed' }),
  },
  ...days.map((d, day): ColumnDef<Person> => ({
    id: d.id,
    header: () => renderComponent(DayHeader, { day: d }),
    cell: ({ row, table }) => {
      const meta = getMeta(table)
      const person = row.original
      const week = meta.schedule[person.id]
      const rest = restBefore(week, day)
      const key = cellKey(person.id, day)
      return renderComponent(ShiftCell, {
        cellKey: key,
        value: week[day],
        label: `${person.name}, ${d.short} ${d.date}`,
        changed: meta.changed.has(key),
        rest: rest !== null && rest < MIN_REST ? rest : null,
        tabbable: meta.active === key,
        onassign: (value: Assignment) => meta.assign(person.id, day, value),
        onkeydown: (event: KeyboardEvent) =>
          meta.onCellKeydown(event, person.id, day),
      })
    },
    footer: ({ table }) =>
      renderComponent(Coverage, {
        have: coverage(getMeta(table).schedule, day),
        need: required(d),
      }),
  })),
  {
    id: 'hours',
    header: () => renderComponent(RightLabel, { text: 'Hours' }),
    cell: ({ row, table }) => {
      const person = row.original
      return renderComponent(HoursCell, {
        person,
        ...load(person, getMeta(table).schedule[person.id]),
      })
    },
  },
]
