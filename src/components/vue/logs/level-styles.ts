import type { LogLevel } from './data'

export const levelStyles: Record<LogLevel, { dot: string; text: string }> = {
  error: { dot: 'bg-red-500', text: 'text-red-600 dark:text-red-400' },
  warn: { dot: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
  info: { dot: 'bg-sky-500', text: 'text-sky-600 dark:text-sky-400' },
  debug: { dot: 'bg-muted-foreground/40', text: 'text-muted-foreground' },
}
