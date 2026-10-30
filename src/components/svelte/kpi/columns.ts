import type { ColumnDef } from '@tanstack/table-core'
import { renderComponent } from '$lib/components/ui/data-table/index.js'
import { cn } from '$lib/utils.js'
import type { Kpi } from './kpi'
import { formatKpiValue } from './kpi'
import ChangeCell from './ChangeCell.svelte'
import MetricLabel from './MetricLabel.svelte'
import Sparkline from './Sparkline.svelte'

export const columns: ColumnDef<Kpi>[] = [
  {
    accessorKey: 'label',
    header: 'Metric',
    cell: ({ getValue }) =>
      renderComponent(MetricLabel, { label: getValue() as string }),
  },
  {
    accessorKey: 'value',
    header: 'Value',
    cell: ({ row }) => formatKpiValue(row.original.value, row.original.unit),
  },
  {
    accessorKey: 'change',
    header: 'Change',
    cell: ({ getValue }) =>
      renderComponent(ChangeCell, { change: getValue() as number }),
  },
  {
    id: 'trend',
    header: 'Trend',
    cell: ({ row }) =>
      renderComponent(Sparkline, {
        data: row.original.trend,
        class: cn(
          'h-7 w-24',
          row.original.change >= 0
            ? 'text-emerald-600 dark:text-emerald-500'
            : 'text-rose-600 dark:text-rose-500',
        ),
      }),
  },
]
