import { RotateCw, TriangleAlert } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils.ts'

interface ErrorStateProps {
  title: string
  description: string
  onRetry?: () => void
  isRetrying?: boolean
  /** `panel` fills an empty table body; `banner` sits above stale rows */
  variant?: 'panel' | 'banner'
}

export function ErrorState({
  title,
  description,
  onRetry,
  isRetrying = false,
  variant = 'panel',
}: ErrorStateProps) {
  const retry = onRetry && (
    <Button variant="outline" size="sm" onClick={onRetry} disabled={isRetrying}>
      <RotateCw className={cn(isRetrying && 'animate-spin')} />
      {isRetrying ? 'Retrying...' : 'Try again'}
    </Button>
  )

  if (variant === 'banner') {
    return (
      <div
        role="alert"
        className="flex flex-wrap items-center gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3"
      >
        <TriangleAlert className="size-4 shrink-0 text-destructive" />
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-medium">{title}</p>
          <p className="text-muted-foreground">{description}</p>
        </div>
        {retry}
      </div>
    )
  }

  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center"
    >
      <div className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlert className="size-5" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="max-w-sm text-sm text-balance text-muted-foreground">
          {description}
        </p>
      </div>
      {retry}
    </div>
  )
}
