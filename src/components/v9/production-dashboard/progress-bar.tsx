import { cn } from '#/lib/utils.ts'

interface ProgressBarProps {
  /** 0–100. Values above 100 (over-target output) are clamped for display. */
  value: number
  className?: string
  barClassName?: string
}

export function ProgressBar({ value, className, barClassName }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-muted', className)}
    >
      <div
        className={cn('h-full rounded-full bg-foreground', barClassName)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
