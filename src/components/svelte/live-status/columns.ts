import type { ColumnDef } from '@tanstack/table-core'
import { renderComponent } from '$lib/components/ui/data-table/index.js'
import LatencyCell from './LatencyCell.svelte'
import ServiceCell from './ServiceCell.svelte'
import StatusIndicator from './StatusIndicator.svelte'
import UptimeCell from './UptimeCell.svelte'

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
      renderComponent(ServiceCell, {
        name: row.original.name,
        region: row.original.region,
      }),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) =>
      renderComponent(StatusIndicator, { status: row.original.status }),
  },
  {
    accessorKey: 'latencyMs',
    header: 'Latency',
    cell: ({ row }) =>
      renderComponent(LatencyCell, {
        latencyMs: row.original.latencyMs,
        isDown: row.original.status === 'down',
      }),
  },
  {
    accessorKey: 'uptime',
    header: 'Uptime (30d)',
    cell: ({ row }) =>
      renderComponent(UptimeCell, { uptime: row.original.uptime }),
  },
]
