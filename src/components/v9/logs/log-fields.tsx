import { Fragment } from 'react'
import { cn } from '#/lib/utils.ts'
import { formatDuration } from './data'
import type { LogEntry } from './data'

function fieldsOf(log: LogEntry): [string, string][] {
  return [
    ['Timestamp', new Date(log.timestamp).toISOString()],
    ['Request ID', log.requestId],
    ['Level', log.level],
    ['Service', log.service],
    ['Region', log.region],
    ['Method', log.method],
    ['Path', log.path],
    ['Status', String(log.status)],
    ['Duration', formatDuration(log.durationMs)],
    ['Message', log.message],
  ]
}

interface LogFieldsProps {
  log: LogEntry
  /** Labels to leave out, when the surrounding layout already shows them */
  omit?: string[]
  className?: string
}

/** Every field of an event, including ones that are not table columns */
export function LogFields({ log, omit = [], className }: LogFieldsProps) {
  return (
    <dl
      className={cn(
        'grid grid-cols-[max-content_1fr] gap-x-6 gap-y-1.5 text-sm whitespace-normal',
        className,
      )}
    >
      {fieldsOf(log)
        .filter(([label]) => !omit.includes(label))
        .map(([label, value]) => (
          <Fragment key={label}>
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="break-all">{value}</dd>
          </Fragment>
        ))}
    </dl>
  )
}
