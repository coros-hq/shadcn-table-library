'use client'

import { useEffect, useRef, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { cn } from '#/lib/utils.ts'
import { columns } from './columns'
import type { Service, ServiceStatus } from './columns'

const TRANSITIONS: Record<ServiceStatus, ServiceStatus[]> = {
  operational: ['operational', 'operational', 'operational', 'degraded'],
  degraded: ['operational', 'operational', 'degraded', 'down'],
  down: ['degraded', 'down', 'down'],
}

function nextStatus(status: ServiceStatus): ServiceStatus {
  const options = TRANSITIONS[status]
  return options[Math.floor(Math.random() * options.length)]
}

function jitterLatency(latencyMs: number, status: ServiceStatus) {
  if (status === 'down') return 0
  const drift = status === 'degraded' ? 40 : 12
  const next = latencyMs + Math.round((Math.random() - 0.5) * drift)
  return Math.max(1, next)
}

interface LiveStatusTableProps {
  data: Service[]
  onDataChange: (updater: (prev: Service[]) => Service[]) => void
}

export function LiveStatusTable({ data, onDataChange }: LiveStatusTableProps) {
  const [isLive, setIsLive] = useState(true)
  const cursor = useRef(0)

  useEffect(() => {
    if (!isLive) return

    const interval = window.setInterval(() => {
      onDataChange((prev) => {
        const index = cursor.current % prev.length
        cursor.current += 1
        return prev.map((service, i) => {
          if (i !== index) return service
          const status = nextStatus(service.status)
          return {
            ...service,
            status,
            latencyMs: jitterLatency(service.latencyMs, status),
          }
        })
      })
    }, 1800)

    return () => window.clearInterval(interval)
  }, [isLive, onDataChange])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsLive((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <span className="relative flex size-2">
            {isLive && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            )}
            <span
              className={cn(
                'relative inline-flex size-2 rounded-full',
                isLive ? 'bg-emerald-500' : 'bg-muted-foreground',
              )}
            />
          </span>
          {isLive ? 'Live' : 'Paused'}
        </button>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
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
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext(),
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
