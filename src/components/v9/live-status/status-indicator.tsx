'use client'

import { cn } from '#/lib/utils.ts'
import type { ServiceStatus } from './columns'

const STATUS_CONFIG: Record<
  ServiceStatus,
  { label: string; dot: string; pulse: boolean }
> = {
  operational: { label: 'Operational', dot: 'bg-emerald-500', pulse: true },
  degraded: { label: 'Degraded', dot: 'bg-amber-500', pulse: true },
  down: { label: 'Down', dot: 'bg-red-500', pulse: false },
}

export function StatusIndicator({ status }: { status: ServiceStatus }) {
  const config = STATUS_CONFIG[status]

  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <span className="relative flex size-2.5">
        {config.pulse && (
          <span
            className={cn(
              'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
              config.dot,
            )}
          />
        )}
        <span
          className={cn('relative inline-flex size-2.5 rounded-full', config.dot)}
        />
      </span>
      {config.label}
    </span>
  )
}
