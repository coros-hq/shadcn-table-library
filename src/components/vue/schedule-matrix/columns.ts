import { h } from 'vue'
import type { ColumnDef, Table } from '@tanstack/vue-table'

import { cn } from '@/lib/utils'
import { covered, days, required, shiftById } from './data'
import type { Assignment, Person, Schedule } from './data'
import { MIN_REST, cellKey, coverage, load, restBefore } from './schedule'
import ShiftCell from './ShiftCell.vue'
import ShiftChip from './ShiftChip.vue'

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
      h('div', { class: 'flex min-w-0 flex-col' }, [
        h('span', { class: 'truncate font-medium' }, row.original.name),
        h(
          'span',
          { class: 'truncate text-xs text-muted-foreground' },
          row.original.role,
        ),
      ]),
    footer: () =>
      h('div', { class: 'flex flex-col text-xs' }, [
        h('span', { class: 'font-medium' }, 'On shift'),
        h('span', { class: 'text-muted-foreground' }, 'of needed'),
      ]),
  },
  ...days.map((d, day): ColumnDef<Person> => ({
    id: d.id,
    header: () =>
      h('div', { class: 'flex flex-col items-center leading-tight' }, [
        h('span', d.short),
        h(
          'span',
          {
            class: 'text-xs font-normal text-muted-foreground tabular-nums',
          },
          d.date,
        ),
      ]),
    cell: ({ row, table }) => {
      const meta = getMeta(table)
      const person = row.original
      const week = meta.schedule[person.id]
      const rest = restBefore(week, day)
      const key = cellKey(person.id, day)
      return h(ShiftCell, {
        cellKey: key,
        value: week[day],
        label: `${person.name}, ${d.short} ${d.date}`,
        changed: meta.changed.has(key),
        rest: rest !== null && rest < MIN_REST ? rest : null,
        tabbable: meta.active === key,
        onAssign: (value: Assignment) => meta.assign(person.id, day, value),
        onKeydown: (event: KeyboardEvent) =>
          meta.onCellKeydown(event, person.id, day),
      })
    },
    footer: ({ table }) => {
      const have = coverage(getMeta(table).schedule, day)
      const need = required(d)
      return h(
        'ul',
        {
          class: 'flex flex-col items-center gap-0.5 text-xs tabular-nums',
        },
        covered.map((shift) => {
          const short = have[shift] < need[shift]
          return h(
            'li',
            {
              key: shift,
              class: cn(
                'flex items-center gap-1',
                short && 'font-semibold text-destructive',
              ),
            },
            [
              h(ShiftChip, { shift, class: 'size-4 text-[10px]' }),
              h('span', { class: 'sr-only' }, `${shiftById[shift].label}:`),
              `${have[shift]}/${need[shift]}`,
              short ? h('span', { class: 'sr-only' }, '(short)') : null,
            ],
          )
        }),
      )
    },
  })),
  {
    id: 'hours',
    header: () => h('span', { class: 'block text-right' }, 'Hours'),
    cell: ({ row, table }) => {
      const person = row.original
      const { hours, diff, status } = load(
        person,
        getMeta(table).schedule[person.id],
      )
      return h('div', { class: 'flex min-w-20 flex-col items-end gap-1' }, [
        h('span', { class: 'text-sm tabular-nums' }, [
          String(hours),
          h(
            'span',
            { class: 'text-muted-foreground' },
            ` / ${person.contract}h`,
          ),
        ]),
        h(
          'span',
          {
            class: cn(
              'text-xs tabular-nums',
              status === 'over'
                ? 'font-medium text-amber-700 dark:text-amber-400'
                : 'text-muted-foreground',
            ),
          },
          status === 'exact'
            ? 'On contract'
            : status === 'over'
              ? `${diff}h over`
              : `${-diff}h free`,
        ),
      ])
    },
  },
]
