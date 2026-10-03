export const levels = ['error', 'warn', 'info', 'debug'] as const
export const services = ['api', 'auth', 'billing', 'worker', 'edge'] as const
export const statusClasses = ['2xx', '3xx', '4xx', '5xx'] as const

export type LogLevel = (typeof levels)[number]
export type Service = (typeof services)[number]
export type StatusClass = (typeof statusClasses)[number]

export type LogEntry = {
  id: string
  /** Epoch ms */
  timestamp: number
  level: LogLevel
  service: Service
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  status: number
  durationMs: number
  message: string
  requestId: string
  region: string
}

// Fixed "now" so relative times render the same on server and client.
export const NOW = Date.UTC(2026, 8, 23, 14, 0, 0)

// Small deterministic PRNG, so the demo data never changes between renders.
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const random = mulberry32(11)
const pick = <T>(items: readonly T[]) =>
  items[Math.floor(random() * items.length)]

const routes: Record<Service, { method: LogEntry['method']; path: string }[]> =
  {
    api: [
      { method: 'GET', path: '/v1/projects' },
      { method: 'GET', path: '/v1/projects/:id' },
      { method: 'POST', path: '/v1/projects' },
      { method: 'DELETE', path: '/v1/projects/:id' },
    ],
    auth: [
      { method: 'POST', path: '/auth/login' },
      { method: 'POST', path: '/auth/refresh' },
      { method: 'GET', path: '/auth/callback' },
    ],
    billing: [
      { method: 'POST', path: '/billing/checkout' },
      { method: 'GET', path: '/billing/invoices' },
      { method: 'POST', path: '/billing/webhook' },
    ],
    worker: [
      { method: 'POST', path: '/jobs/email' },
      { method: 'POST', path: '/jobs/thumbnail' },
    ],
    edge: [
      { method: 'GET', path: '/' },
      { method: 'GET', path: '/pricing' },
      { method: 'GET', path: '/assets/app.js' },
    ],
  }

const messages: Record<LogLevel, readonly string[]> = {
  error: [
    'Upstream timed out after 10000ms',
    'Stripe webhook signature mismatch',
    'Connection pool exhausted (max=20)',
    'Unhandled rejection: ECONNRESET',
  ],
  warn: [
    'Rate limit reached for token',
    'Invalid refresh token',
    'Validation failed: name is required',
    'Slow query: 1843ms on projects_by_owner',
  ],
  info: [
    'Request completed',
    'User signed in',
    'Invoice generated',
    'Cache hit',
    'Job finished',
  ],
  debug: [
    'Retrying job (attempt 2 of 5)',
    'Feature flag new-pricing evaluated to false',
    'Cache miss, fetching from origin',
  ],
}

const regions = ['iad1', 'fra1', 'sfo1', 'hnd1']

function hex(length: number) {
  return Array.from({ length }, () =>
    Math.floor(random() * 16).toString(16),
  ).join('')
}

function levelFor(service: Service): LogLevel {
  const roll = random()
  if (roll < 0.1) return 'error'
  if (roll < 0.26) return 'warn'
  // Workers are chatty at debug level; request handlers mostly aren't
  if (roll < (service === 'worker' ? 0.6 : 0.36)) return 'debug'
  return 'info'
}

function statusFor(level: LogLevel, method: LogEntry['method']): number {
  if (level === 'error') return pick([500, 502, 503, 504])
  if (level === 'warn') return pick([400, 401, 404, 422, 429])
  if (method === 'POST') return 201
  return random() < 0.15 ? 304 : 200
}

const HOUR = 3_600_000

let msAgo = 1_200
export const logs: LogEntry[] = Array.from({ length: 80 }, (_, i) => {
  const service = pick(services)
  const route = pick(routes[service])
  const level = levelFor(service)
  const entry: LogEntry = {
    id: `log_${hex(12)}`,
    timestamp: NOW - msAgo,
    level,
    service,
    method: route.method,
    path: route.path,
    status: statusFor(level, route.method),
    durationMs:
      level === 'error'
        ? Math.floor(2_000 + random() * 8_000)
        : Math.floor(4 + random() * 380),
    message: pick(messages[level]),
    requestId: `req_${hex(8)}`,
    region: pick(regions),
  }
  // Gaps grow with age, so recent events are dense and the list spans ~2 weeks
  msAgo += Math.floor((random() * 2 + i * 0.07) * HOUR)
  return entry
})

export function toStatusClass(status: number): StatusClass {
  return `${Math.floor(status / 100)}xx` as StatusClass
}

const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]
const pad = (n: number) => String(n).padStart(2, '0')

/** "Sep 23" in UTC, so server and client render the same string */
export function formatDay(timestamp: number): string {
  const d = new Date(timestamp)
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}`
}

/** "13:59:58" in UTC */
export function formatTime(timestamp: number): string {
  const d = new Date(timestamp)
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`
}

export function formatDuration(ms: number): string {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`
}
