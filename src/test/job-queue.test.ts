import { describe, expect, it } from 'vitest'
import { seedJobs } from '#/components/job-queue/data'
import type { Job } from '#/components/job-queue/data'
import {
  CONCURRENCY,
  backoff,
  cancel,
  duration,
  formatDuration,
  inView,
  retry,
  tick,
} from '#/components/job-queue/queue'

/** Runs the queue for `ms` of demo clock, in 200ms steps */
function run(jobs: Job[], from: number, ms: number) {
  let now = from
  let next = jobs
  while (now < from + ms) {
    now += 200
    next = tick(next, now, 200)
  }
  return { jobs: next, now }
}

const byId = (jobs: Job[], id: string) => jobs.find((j) => j.id === id)!

describe('tick', () => {
  it('never runs more jobs than there are workers', () => {
    let jobs = seedJobs()
    let now = 0
    for (let i = 0; i < 300; i++) {
      ;({ jobs, now } = run(jobs, now, 200))
      expect(
        jobs.filter((j) => j.status === 'running').length,
      ).toBeLessThanOrEqual(CONCURRENCY)
    }
  })

  it('starts the job that has waited longest when a worker frees up', () => {
    const { jobs } = run(seedJobs(), 0, 20_000)
    // The invoice export finishes first; the payout report was queued first
    expect(byId(jobs, 'job_51d0').status).toBe('succeeded')
    expect(byId(jobs, 'job_c2e8').attempts.length).toBeGreaterThan(0)
  })

  it('retries a failure automatically after a backoff, then succeeds', () => {
    let { jobs, now } = run(seedJobs(), 0, 6_000)
    const resize = byId(jobs, 'job_a904')
    expect(resize.status).toBe('retrying')
    expect(resize.attempts[0].error?.code).toBe('ETIMEDOUT')
    expect(resize.retryAt! - resize.attempts[0].endedAt!).toBe(backoff(1))
    ;({ jobs, now } = run(jobs, now, 60_000))
    expect(byId(jobs, 'job_a904')).toMatchObject({ status: 'succeeded' })
    expect(byId(jobs, 'job_a904').attempts).toHaveLength(2)
  })

  it('fails for good once the attempts run out', () => {
    const { jobs } = run(seedJobs(), 0, 120_000)
    const report = byId(jobs, 'job_c2e8')
    expect(report.status).toBe('failed')
    expect(report.attempts).toHaveLength(3)
    expect(report.attempts.every((a) => a.error)).toBe(true)
  })
})

describe('actions', () => {
  it('retries with one more attempt than before', () => {
    let jobs = retry(seedJobs(), ['job_3c71'], 0)
    expect(byId(jobs, 'job_3c71')).toMatchObject({
      status: 'queued',
      maxAttempts: 4,
      done: 0,
    })
    ;({ jobs } = run(jobs, 0, 120_000))
    // Attempt 4 has no scripted failure
    expect(byId(jobs, 'job_3c71').status).toBe('succeeded')
  })

  it('leaves running and finished jobs alone when retrying', () => {
    const jobs = seedJobs()
    expect(retry(jobs, ['job_51d0', 'job_8f2a'], 0)).toEqual(jobs)
  })

  it('cancels a running job and closes its attempt', () => {
    const jobs = cancel(seedJobs(), 'job_51d0', 1_000)
    const exp = byId(jobs, 'job_51d0')
    expect(exp.status).toBe('canceled')
    expect(exp.attempts[0]).toMatchObject({ endedAt: 1_000, canceled: true })
  })
})

describe('display helpers', () => {
  it('sums running time over attempts, leaving out the waits between them', () => {
    const jobs = seedJobs()
    expect(duration(byId(jobs, 'job_8f2a'), 0)).toBe(30_000)
    expect(duration(byId(jobs, 'job_51d0'), 4_000)).toBe(10_000)
    expect(duration(byId(jobs, 'job_3c71'), 0)).toBe(9_000 + 9_000 + 8_000)
    expect(duration(byId(jobs, 'job_77b3'), 0)).toBeNull()
  })

  it('formats durations and groups statuses into views', () => {
    expect(formatDuration(9_400)).toBe('9s')
    expect(formatDuration(64_000)).toBe('1m 04s')
    expect(inView('retrying', 'active')).toBe(true)
    expect(inView('canceled', 'done')).toBe(true)
    expect(inView('failed', 'active')).toBe(false)
  })
})
