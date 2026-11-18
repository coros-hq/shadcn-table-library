import { useEffect, useState } from 'react'
import { RotateCcw } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { seedJobs } from './data'
import type { Job } from './data'
import { JobQueueTable } from './data-table'
import { CONCURRENCY, cancel, inView, isActive, retry, tick } from './queue'
import type { View } from './queue'

const TICK = 200

const views: { id: View; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'failed', label: 'Failed' },
  { id: 'done', label: 'Done' },
]

interface Queue {
  /** Demo clock in ms. It starts at 0 on the server and in the browser alike,
   *  so both render the same durations. */
  now: number
  jobs: Job[]
}

const start = (): Queue => ({ now: 0, jobs: seedJobs() })

export function JobQueueDemo() {
  const [queue, setQueue] = useState<Queue>(start)
  const [view, setView] = useState<View>('all')
  const { now, jobs } = queue

  const busy = jobs.some((j) => isActive(j.status))
  // The clock only runs while something is queued, running or retrying
  useEffect(() => {
    if (!busy) return
    const timer = setInterval(() => {
      setQueue((q) => ({
        now: q.now + TICK,
        jobs: tick(q.jobs, q.now + TICK, TICK),
      }))
    }, TICK)
    return () => clearInterval(timer)
  }, [busy])

  const count = (v: View) => jobs.filter((j) => inView(j.status, v)).length
  const running = jobs.filter((j) => j.status === 'running').length
  const waiting = jobs.filter(
    (j) => j.status === 'queued' || j.status === 'retrying',
  ).length
  const failed = jobs.filter((j) => j.status === 'failed')

  const update = (fn: (jobs: Job[]) => Job[]) =>
    setQueue((q) => ({ ...q, jobs: fn(q.jobs) }))

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {running} of {CONCURRENCY} workers busy
          </span>
          {' · '}
          {waiting} waiting · {failed.length} failed
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!failed.length}
            onClick={() =>
              update((js) =>
                retry(
                  js,
                  failed.map((j) => j.id),
                  now,
                ),
              )
            }
          >
            <RotateCcw /> Retry all failed
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setQueue(start())}>
            Reset demo
          </Button>
        </div>
      </div>

      <div
        role="group"
        aria-label="Show jobs"
        className="inline-flex rounded-md border p-0.5"
      >
        {views.map((v) => (
          <button
            key={v.id}
            type="button"
            aria-pressed={view === v.id}
            onClick={() => setView(v.id)}
            className="flex h-7 items-center gap-1.5 rounded px-2.5 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:bg-muted aria-pressed:text-foreground"
          >
            {v.label}
            <span className="text-xs tabular-nums">{count(v.id)}</span>
          </button>
        ))}
      </div>

      <JobQueueTable
        jobs={jobs}
        view={view}
        meta={{
          now,
          retry: (id) => update((js) => retry(js, [id], now)),
          cancel: (id) => update((js) => cancel(js, id, now)),
        }}
      />
    </div>
  )
}
