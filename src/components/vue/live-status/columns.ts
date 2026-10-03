import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import StatusIndicator from './StatusIndicator.vue'

export type ServiceStatus = 'operational' | 'degraded' | 'down'

export type Service = {
  id: string
  name: string
  region: string
  status: ServiceStatus
  latencyMs: number
  uptime: number
}

export const columns: ColumnDef<Service>[] = [
  {
    accessorKey: 'name',
    header: 'Service',
    cell: ({ row }) =>
      h('div', [
        h('div', { class: 'font-medium' }, row.original.name),
        h('div', { class: 'text-xs text-muted-foreground' }, row.original.region),
      ]),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => h(StatusIndicator, { status: row.original.status }),
  },
  {
    accessorKey: 'latencyMs',
    header: 'Latency',
    cell: ({ row }) =>
      row.original.status === 'down'
        ? h('span', { class: 'text-muted-foreground' }, '—')
        : h('span', { class: 'tabular-nums' }, `${row.original.latencyMs}ms`),
  },
  {
    accessorKey: 'uptime',
    header: 'Uptime (30d)',
    cell: ({ row }) =>
      h('span', { class: 'tabular-nums' }, `${row.original.uptime.toFixed(2)}%`),
  },
]
