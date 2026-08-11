'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { StatusIndicator } from './status-indicator'

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
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.name}</div>
        <div className="text-xs text-muted-foreground">
          {row.original.region}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusIndicator status={row.original.status} />,
  },
  {
    accessorKey: 'latencyMs',
    header: 'Latency',
    cell: ({ row }) =>
      row.original.status === 'down' ? (
        <span className="text-muted-foreground">—</span>
      ) : (
        <span className="tabular-nums">{row.original.latencyMs}ms</span>
      ),
  },
  {
    accessorKey: 'uptime',
    header: 'Uptime (30d)',
    cell: ({ row }) => (
      <span className="tabular-nums">{row.original.uptime.toFixed(2)}%</span>
    ),
  },
]
