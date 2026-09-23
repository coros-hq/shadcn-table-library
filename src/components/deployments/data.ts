export const statuses = [
  'Ready',
  'Building',
  'Queued',
  'Error',
  'Canceled',
] as const
export const environments = ['Production', 'Preview'] as const

export type DeploymentStatus = (typeof statuses)[number]
export type Environment = (typeof environments)[number]

export type Deployment = {
  id: string
  status: DeploymentStatus
  environment: Environment
  branch: string
  sha: string
  message: string
  author: string
  /** Epoch ms */
  createdAt: number
  /** Build time in seconds; null while still queued */
  durationSec: number | null
}

// Fixed "now" so relative times render the same on server and client.
export const NOW = Date.UTC(2026, 8, 23, 14, 0, 0)

const MIN = 60_000

// Small deterministic PRNG, so the demo data never changes between renders.
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const random = mulberry32(7)
const pick = <T>(items: readonly T[]) =>
  items[Math.floor(random() * items.length)]

const branches = [
  'main',
  'main',
  'main',
  'feat/billing-v2',
  'fix/login-redirect',
  'chore/deps',
  'feat/search',
]
const authors = ['ava', 'liam', 'sofia', 'noah', 'mia']
const messages = [
  'Add usage-based billing tiers',
  'Fix redirect loop after SSO login',
  'Bump dependencies',
  'Cache search results at the edge',
  'Tighten CSP headers',
  'Move pricing page to ISR',
  'Handle empty cart in checkout',
  'Improve cold start time',
  'Refactor auth middleware',
  'Add OpenGraph images',
  'Fix flaky e2e test',
  'Update onboarding copy',
]

function hexSha() {
  return Array.from({ length: 7 }, () =>
    Math.floor(random() * 16).toString(16),
  ).join('')
}

function statusFor(index: number): DeploymentStatus {
  // Newest two are still in flight, like a real deploy list
  if (index === 0) return 'Building'
  if (index === 1) return 'Queued'
  const roll = random()
  if (roll < 0.72) return 'Ready'
  if (roll < 0.86) return 'Error'
  return 'Canceled'
}

let minutesAgo = 2
export const deployments: Deployment[] = Array.from({ length: 42 }, (_, i) => {
  const branch = pick(branches)
  const status = statusFor(i)
  const createdAt = NOW - minutesAgo * MIN
  // Gaps grow with age, so the list spans roughly a month
  minutesAgo += Math.floor(8 + random() * 40 + i * i * 0.9)
  return {
    id: `dpl_${hexSha()}${hexSha().slice(0, 3)}`,
    status,
    environment: branch === 'main' ? 'Production' : 'Preview',
    branch,
    sha: hexSha(),
    message: pick(messages),
    author: pick(authors),
    createdAt,
    durationSec:
      status === 'Queued'
        ? null
        : status === 'Building'
          ? 42
          : Math.floor(35 + random() * 200),
  }
})

/** Latest successful production deploy — the one serving traffic */
export const currentProductionId = deployments.find(
  (d) => d.environment === 'Production' && d.status === 'Ready',
)?.id

export function formatAge(createdAt: number): string {
  const minutes = Math.round((NOW - createdAt) / MIN)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m ? `${m}m ${s}s` : `${s}s`
}
