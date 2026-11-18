export type JobStatus =
  'queued' | 'running' | 'retrying' | 'succeeded' | 'failed' | 'canceled'

export interface JobError {
  code: string
  message: string
  /** Stack frames, top first */
  trace: string[]
}

export interface Attempt {
  number: number
  /** Demo clock time, in ms */
  startedAt: number
  endedAt?: number
  /** Items processed when the attempt ended */
  processed?: number
  error?: JobError
  canceled?: boolean
}

export interface Job {
  id: string
  name: string
  queue: 'emails' | 'exports' | 'media' | 'billing' | 'search'
  status: JobStatus
  /** Items to process, and how many are done in the current attempt */
  total: number
  done: number
  /** Items per second while running */
  rate: number
  attempts: Attempt[]
  maxAttempts: number
  /** Demo clock time the job was queued */
  queuedAt: number
  /** When a retrying job goes back in the queue */
  retryAt?: number
  /**
   * The demo's script: attempt N fails once it reaches failures[N - 1].at of
   * its items. In a real app this is whatever your workers report.
   */
  failures: (JobError & { at: number })[]
}

const timeout: JobError = {
  code: 'ETIMEDOUT',
  message: 'Upload to storage timed out after 30000ms',
  trace: [
    'TimeoutError: Upload to storage timed out after 30000ms',
    'at uploadVariant (workers/media/resize.ts:88:11)',
    'at processImage (workers/media/resize.ts:41:5)',
    'at Worker.run (lib/queue/worker.ts:126:20)',
  ],
}

const rateLimited: JobError = {
  code: 'HTTP 429',
  message: 'Stripe rate limit exceeded: too many requests in 1s',
  trace: [
    'StripeRateLimitError: Too many requests in 1s',
    'at request (lib/stripe/client.ts:54:13)',
    'at listCustomers (workers/billing/sync.ts:23:18)',
    'at Worker.run (lib/queue/worker.ts:126:20)',
  ],
}

const missingRate: JobError = {
  code: 'E_FX_MISSING',
  message: 'No exchange rate for CHF on 2026-10-31',
  trace: [
    'ReportError: No exchange rate for CHF on 2026-10-31',
    'at convert (workers/reports/fx.ts:31:9)',
    'at buildPayoutRow (workers/reports/payouts.ts:77:22)',
    'at Worker.run (lib/queue/worker.ts:126:20)',
  ],
}

/**
 * The queue when the demo starts, at clock time 0. Finished jobs ran in the
 * past, so their times are negative.
 */
export function seedJobs(): Job[] {
  return [
    {
      id: 'job_8f2a',
      name: 'Send welcome emails',
      queue: 'emails',
      status: 'succeeded',
      total: 1200,
      done: 1200,
      rate: 40,
      attempts: [
        { number: 1, startedAt: -95_000, endedAt: -65_000, processed: 1200 },
      ],
      maxAttempts: 3,
      queuedAt: -96_000,
      failures: [],
    },
    {
      id: 'job_3c71',
      name: 'Sync Stripe customers',
      queue: 'billing',
      status: 'failed',
      total: 4200,
      done: 1260,
      rate: 150,
      attempts: [
        {
          number: 1,
          startedAt: -88_000,
          endedAt: -79_000,
          processed: 1310,
          error: rateLimited,
        },
        {
          number: 2,
          startedAt: -75_000,
          endedAt: -66_000,
          processed: 1290,
          error: rateLimited,
        },
        {
          number: 3,
          startedAt: -58_000,
          endedAt: -50_000,
          processed: 1260,
          error: rateLimited,
        },
      ],
      maxAttempts: 3,
      queuedAt: -90_000,
      // A manual retry is attempt 4, which has no scripted failure
      failures: [
        { ...rateLimited, at: 0.31 },
        { ...rateLimited, at: 0.3 },
        { ...rateLimited, at: 0.3 },
      ],
    },
    {
      id: 'job_51d0',
      name: 'Export invoices (Q3)',
      queue: 'exports',
      status: 'running',
      total: 3400,
      done: 900,
      rate: 160,
      attempts: [{ number: 1, startedAt: -6_000 }],
      maxAttempts: 3,
      queuedAt: -7_000,
      failures: [],
    },
    {
      id: 'job_a904',
      name: 'Resize product images',
      queue: 'media',
      status: 'running',
      total: 860,
      done: 120,
      rate: 60,
      attempts: [{ number: 1, startedAt: -2_000 }],
      maxAttempts: 3,
      queuedAt: -3_000,
      failures: [{ ...timeout, at: 0.55 }],
    },
    {
      id: 'job_c2e8',
      name: 'Generate payout report',
      queue: 'billing',
      status: 'queued',
      total: 240,
      done: 0,
      rate: 40,
      attempts: [],
      maxAttempts: 3,
      queuedAt: -1_500,
      failures: [
        { ...missingRate, at: 0.8 },
        { ...missingRate, at: 0.8 },
        { ...missingRate, at: 0.8 },
      ],
    },
    {
      id: 'job_77b3',
      name: 'Rebuild search index',
      queue: 'search',
      status: 'queued',
      total: 5000,
      done: 0,
      rate: 500,
      attempts: [],
      maxAttempts: 3,
      queuedAt: -1_000,
      failures: [],
    },
    {
      id: 'job_e015',
      name: 'Send trial reminders',
      queue: 'emails',
      status: 'queued',
      total: 300,
      done: 0,
      rate: 50,
      attempts: [],
      maxAttempts: 3,
      queuedAt: -500,
      failures: [],
    },
    {
      id: 'job_0d6c',
      name: 'Purge expired sessions',
      queue: 'search',
      status: 'canceled',
      total: 18_000,
      done: 7_400,
      rate: 900,
      attempts: [
        {
          number: 1,
          startedAt: -40_000,
          endedAt: -32_000,
          processed: 7_400,
          canceled: true,
        },
      ],
      maxAttempts: 3,
      queuedAt: -41_000,
      failures: [],
    },
  ]
}
