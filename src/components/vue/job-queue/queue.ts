import type { Attempt, Job, JobStatus } from './data'

// A tiny job runner, so the table has something live to show. Every function
// takes the jobs and returns new ones; nothing is mutated. In a real app the
// server does this and the table only renders what it reports.

/** How many jobs run at once */
export const CONCURRENCY = 2

/** Wait before automatic retry N: 2s, 4s, 8s… */
export const backoff = (attempt: number) => 2_000 * 2 ** (attempt - 1)

export const isActive = (status: JobStatus) =>
  status === 'queued' || status === 'running' || status === 'retrying'

function endAttempt(job: Job, patch: Partial<Attempt>, now: number): Attempt[] {
  return job.attempts.map((a, i) =>
    i === job.attempts.length - 1
      ? { ...a, endedAt: now, processed: Math.round(job.done), ...patch }
      : a,
  )
}

/** Advances every job to clock time `now`, `dt` ms after the last tick */
export function tick(jobs: Job[], now: number, dt: number): Job[] {
  let next = jobs.map((job): Job => {
    if (
      job.status === 'retrying' &&
      job.retryAt !== undefined &&
      now >= job.retryAt
    ) {
      return { ...job, status: 'queued', retryAt: undefined }
    }
    if (job.status !== 'running') return job

    const done = Math.min(job.total, job.done + (job.rate * dt) / 1000)
    const attempt = job.attempts.length
    const failure = job.failures[attempt - 1] as
      (typeof job.failures)[number] | undefined

    if (failure && done >= failure.at * job.total) {
      const { at: _at, ...error } = failure
      const failed = { ...job, done }
      const attempts = endAttempt(failed, { error }, now)
      // Retry on its own until the attempts run out
      return attempt < job.maxAttempts
        ? {
            ...failed,
            attempts,
            status: 'retrying',
            retryAt: now + backoff(attempt),
          }
        : { ...failed, attempts, status: 'failed' }
    }
    if (done >= job.total) {
      const finished = { ...job, done }
      return {
        ...finished,
        attempts: endAttempt(finished, {}, now),
        status: 'succeeded',
      }
    }
    return { ...job, done }
  })

  // Fill free slots with the jobs that have waited longest
  let running = next.filter((j) => j.status === 'running').length
  const waiting = next
    .filter((j) => j.status === 'queued')
    .sort((a, b) => a.queuedAt - b.queuedAt)
  for (const job of waiting) {
    if (running >= CONCURRENCY) break
    running++
    next = next.map((j) =>
      j.id === job.id
        ? {
            ...j,
            status: 'running',
            done: 0,
            attempts: [
              ...j.attempts,
              { number: j.attempts.length + 1, startedAt: now },
            ],
          }
        : j,
    )
  }
  return next
}

/** Puts a failed or canceled job back in the queue, with one more attempt */
export function retry(jobs: Job[], ids: string[], now: number): Job[] {
  return jobs.map((job) =>
    ids.includes(job.id) &&
    (job.status === 'failed' || job.status === 'canceled')
      ? {
          ...job,
          status: 'queued',
          done: 0,
          queuedAt: now,
          maxAttempts: Math.max(job.maxAttempts, job.attempts.length + 1),
        }
      : job,
  )
}

/** Stops a job that is waiting or running */
export function cancel(jobs: Job[], id: string, now: number): Job[] {
  return jobs.map((job) => {
    if (job.id !== id || !isActive(job.status)) return job
    return {
      ...job,
      status: 'canceled',
      retryAt: undefined,
      attempts:
        job.status === 'running'
          ? endAttempt(job, { canceled: true }, now)
          : job.attempts,
    }
  })
}

/**
 * Time spent running, summed over every attempt: the waits between attempts
 * (backoff, sitting in Failed) don't count. Null until the first attempt.
 */
export function duration(job: Job, now: number) {
  if (!job.attempts.length) return null
  return job.attempts.reduce(
    (sum, a) => sum + ((a.endedAt ?? now) - a.startedAt),
    0,
  )
}

export const formatDuration = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000))
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  return `${m}m ${String(s % 60).padStart(2, '0')}s`
}

export const hasErrors = (job: Job) => job.attempts.some((a) => a.error)

export type View = 'all' | 'active' | 'failed' | 'done'

export const inView = (status: JobStatus, view: View) =>
  view === 'all' ||
  (view === 'active'
    ? isActive(status)
    : view === 'failed'
      ? status === 'failed'
      : status === 'succeeded' || status === 'canceled')
