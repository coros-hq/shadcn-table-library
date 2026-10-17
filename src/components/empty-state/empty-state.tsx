import type * as React from 'react'

import { cn } from '#/lib/utils.ts'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  /** Primary call to action, e.g. a "Create" or "Clear filters" button */
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-6 py-14 text-center',
        className,
      )}
    >
      <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground [&_svg]:size-5">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="max-w-sm text-sm text-balance text-muted-foreground">
          {description}
        </p>
      </div>
      {action}
    </div>
  )
}
