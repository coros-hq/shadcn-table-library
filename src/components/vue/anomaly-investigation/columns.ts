import { h } from 'vue'
import type { ColumnDef, Table } from '@tanstack/vue-table'
import { ArrowDown, ArrowUp, Check, ChevronRight } from '@lucide/vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  change,
  distance,
  formatChange,
  formatValue,
  kindOf,
  severity,
  verdict,
} from './anomalies'
import type { Metric } from './data'
import RangeBar from './RangeBar.vue'
import { kindStyle } from './styles'
import type { AnomalyMeta } from './styles'

const getMeta = (table: Table<Metric>) =>
  table.options.meta as unknown as AnomalyMeta

const icons = { spike: ArrowUp, drop: ArrowDown }

export const columns: ColumnDef<Metric>[] = [
  {
    id: 'expand',
    header: () => h('span', { class: 'sr-only' }, 'History'),
    cell: ({ row }) =>
      h(
        Button,
        {
          variant: 'ghost',
          size: 'icon',
          class: 'size-7',
          'aria-expanded': row.getIsExpanded(),
          'aria-label': `${row.getIsExpanded() ? 'Hide' : 'Show'} history for ${row.original.name}`,
          onClick: row.getToggleExpandedHandler(),
        },
        () =>
          h(ChevronRight, {
            class: cn(
              'transition-transform motion-reduce:transition-none',
              row.getIsExpanded() && 'rotate-90',
            ),
          }),
      ),
  },
  {
    id: 'metric',
    header: 'Metric',
    cell: ({ row }) => {
      const kind = kindOf(row.original.today)
      return h('div', { class: 'flex flex-col sm:min-w-36' }, [
        h('span', { class: 'font-medium' }, row.original.name),
        h(
          'span',
          { class: 'text-xs text-muted-foreground' },
          row.original.segment,
        ),
        // On phones the Flag column is hidden; the flag shows here
        kind === 'normal'
          ? null
          : h(
              'span',
              {
                class: cn(
                  'flex items-center gap-1 text-xs sm:hidden',
                  kindStyle[kind].badge,
                ),
              },
              [
                h(icons[kind], { class: 'size-3' }),
                `${kindStyle[kind].label}, ${severity(row.original.today)}`,
              ],
            ),
      ])
    },
  },
  {
    id: 'actual',
    header: () => h('span', { class: 'block text-right' }, 'Today'),
    cell: ({ row }) =>
      h(
        'span',
        { class: 'block text-right font-medium tabular-nums' },
        formatValue(row.original.today.actual, row.original),
      ),
  },
  {
    id: 'range',
    header: 'Expected range',
    cell: ({ row }) => h(RangeBar, { metric: row.original }),
  },
  {
    id: 'change',
    // Sorted by how far outside the range, so the worst comes first
    accessorFn: (m) => distance(m.today),
    header: () => h('span', { class: 'block text-right' }, 'vs expected'),
    cell: ({ row }) => {
      const m = row.original
      return h('div', { class: 'flex flex-col items-end' }, [
        h('span', { class: 'tabular-nums' }, formatChange(change(m.today))),
        kindOf(m.today) === 'normal'
          ? null
          : h('span', { class: 'text-xs text-muted-foreground' }, verdict(m)),
      ])
    },
  },
  {
    id: 'kind',
    accessorFn: (m) => kindOf(m.today),
    header: 'Flag',
    cell: ({ row }) => {
      const kind = kindOf(row.original.today)
      if (kind === 'normal')
        return h('span', { class: 'text-sm text-muted-foreground' }, 'In range')
      return h('div', { class: 'flex flex-col items-start gap-0.5' }, [
        h(
          Badge,
          { variant: 'outline', class: cn('gap-1', kindStyle[kind].badge) },
          () => [h(icons[kind], { class: 'size-3' }), kindStyle[kind].label],
        ),
        h(
          'span',
          { class: 'text-xs text-muted-foreground capitalize' },
          severity(row.original.today) ?? '',
        ),
      ])
    },
  },
  {
    id: 'review',
    header: () => h('span', { class: 'sr-only' }, 'Review'),
    cell: ({ row, table }) => {
      const m = row.original
      if (kindOf(m.today) === 'normal') return null
      const meta = getMeta(table)
      const done = meta.reviewed.has(m.id)
      return h('div', { class: 'flex justify-end' }, [
        h(
          Button,
          {
            variant: done ? 'ghost' : 'outline',
            size: 'sm',
            'aria-pressed': done,
            'aria-label': done
              ? `${m.name} reviewed. Mark as not reviewed`
              : `Mark ${m.name} reviewed`,
            onClick: () => meta.toggleReviewed(m.id),
            class: cn(done && 'text-muted-foreground'),
          },
          // Icon only on phones, where the table has little room
          () => [
            h(Check, { class: cn(!done && 'sm:hidden') }),
            h(
              'span',
              { class: 'hidden sm:inline' },
              done ? 'Reviewed' : 'Mark reviewed',
            ),
          ],
        ),
      ])
    },
  },
]
