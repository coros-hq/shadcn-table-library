import { CircleAlert, CircleCheck, LoaderCircle } from 'lucide-react'

import type { Job } from './data'
import { formatDuration, isActive } from './queue'

/**
 * The expanded row: every attempt, newest first. Failed attempts show their
 * error code, message and stack trace, so a retry can be judged on what
 * actually went wrong.
 */
export function JobErrors({ job }: { job: Job }) {
  const attempts = [...job.attempts].reverse()
  return (
    <ol className="space-y-3">
      {attempts.map((attempt) => {
        const running = !attempt.endedAt && isActive(job.status)
        const took =
          attempt.endedAt !== undefined
            ? formatDuration(attempt.endedAt - attempt.startedAt)
            : null
        return (
          <li key={attempt.number} className="space-y-1.5">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              {attempt.error ? (
                <CircleAlert className="size-4 text-destructive" />
              ) : running ? (
                <LoaderCircle className="size-4 text-blue-600 motion-safe:animate-spin" />
              ) : (
                <CircleCheck className="size-4 text-muted-foreground" />
              )}
              <span className="font-medium">Attempt {attempt.number}</span>
              <span className="text-muted-foreground">
                {running
                  ? 'running now'
                  : attempt.error
                    ? `failed after ${took} at ${attempt.processed?.toLocaleString('en-US')} of ${job.total.toLocaleString('en-US')} items`
                    : attempt.canceled
                      ? `canceled after ${took}`
                      : `succeeded in ${took}`}
              </span>
            </p>
            {attempt.error ? (
              <div className="ml-6 overflow-hidden rounded-md border border-destructive/20">
                <p className="flex flex-wrap gap-x-2 bg-destructive/5 px-3 py-2 text-sm">
                  <code className="font-mono text-xs font-medium text-destructive">
                    {attempt.error.code}
                  </code>
                  <span>{attempt.error.message}</span>
                </p>
                <pre className="overflow-x-auto px-3 py-2 font-mono text-xs leading-relaxed text-muted-foreground">
                  {attempt.error.trace
                    .map((line, i) => (i === 0 ? line : `    ${line}`))
                    .join('\n')}
                </pre>
              </div>
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
