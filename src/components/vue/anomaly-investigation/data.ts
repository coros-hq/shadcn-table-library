export type Unit = 'count' | 'currency' | 'percent' | 'ms'

/** One day of a metric: what happened, and the range the model expected */
export interface Point {
  /** "2026-11-18" */
  date: string
  actual: number
  low: number
  high: number
}

export interface Metric {
  id: string
  name: string
  segment: string
  unit: Unit
  /** Whether higher is better, so a spike can read as good news or bad */
  better: 'up' | 'down'
  /** The fourteen days before today, oldest first */
  history: Point[]
  today: Point
}

/** The demo's "today", fixed so the server and browser agree */
export const TODAY = '2026-11-18'
const DAYS = 15

// Deterministic, so the server and the browser render the same numbers
function random(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Nov 4 to Nov 18; day 0 is a Wednesday */
const dates = Array.from(
  { length: DAYS },
  (_, i) => `2026-11-${String(4 + i).padStart(2, '0')}`,
)
const isWeekend = (i: number) => [3, 4, 10, 11].includes(i)

export interface Spec {
  id: string
  name: string
  segment: string
  unit: Unit
  better: Metric['better']
  base: number
  /** Weekend level, as a share of the weekday one */
  weekend: number
  /** Half the expected range, as a share of the expected value */
  band: number
  /** Today's actual as a share of expected; 1 is right on target */
  today: number
  /** Earlier days that also went outside the range: [day, share] */
  past?: [number, number][]
  round: number
}

const specs: Spec[] = [
  {
    id: 'checkout-rate',
    name: 'Checkout conversion',
    segment: 'Web',
    unit: 'percent',
    better: 'up',
    base: 3.4,
    weekend: 0.9,
    band: 0.08,
    today: 0.71,
    round: 2,
  },
  {
    id: 'p95-latency',
    name: 'API p95 latency',
    segment: 'EU region',
    unit: 'ms',
    better: 'down',
    base: 420,
    weekend: 0.85,
    band: 0.12,
    today: 1.62,
    past: [[6, 1.21]],
    round: 0,
  },
  {
    id: 'payment-failures',
    name: 'Payment failures',
    segment: 'Card payments',
    unit: 'count',
    better: 'down',
    base: 46,
    weekend: 0.7,
    band: 0.25,
    today: 2.4,
    round: 0,
  },
  {
    id: 'revenue-us',
    name: 'Revenue',
    segment: 'United States',
    unit: 'currency',
    better: 'up',
    base: 48_000,
    weekend: 0.75,
    band: 0.1,
    today: 1.27,
    past: [[3, 1.18]],
    round: 0,
  },
  {
    id: 'signups',
    name: 'Signups',
    segment: 'Organic search',
    unit: 'count',
    better: 'up',
    base: 860,
    weekend: 0.6,
    band: 0.12,
    today: 0.82,
    round: 0,
  },
  {
    id: 'refund-rate',
    name: 'Refund rate',
    segment: 'All orders',
    unit: 'percent',
    better: 'down',
    base: 1.6,
    weekend: 1,
    band: 0.15,
    today: 1.19,
    round: 2,
  },
  {
    id: 'support-tickets',
    name: 'Support tickets',
    segment: 'Billing',
    unit: 'count',
    better: 'down',
    base: 120,
    weekend: 0.5,
    band: 0.2,
    today: 1.55,
    round: 0,
  },
  {
    id: 'email-open',
    name: 'Email open rate',
    segment: 'Newsletter',
    unit: 'percent',
    better: 'up',
    base: 38,
    weekend: 1,
    band: 0.07,
    today: 0.86,
    past: [[8, 0.9]],
    round: 1,
  },
  {
    id: 'orders',
    name: 'Orders',
    segment: 'All channels',
    unit: 'count',
    better: 'up',
    base: 2_300,
    weekend: 0.8,
    band: 0.1,
    today: 1.04,
    round: 0,
  },
  {
    id: 'active-users',
    name: 'Active users',
    segment: 'Mobile app',
    unit: 'count',
    better: 'up',
    base: 18_400,
    weekend: 1.1,
    band: 0.06,
    today: 0.98,
    round: 0,
  },
  {
    id: 'aov',
    name: 'Average order value',
    segment: 'All orders',
    unit: 'currency',
    better: 'up',
    base: 64,
    weekend: 1.05,
    band: 0.08,
    today: 1.03,
    round: 2,
  },
  {
    id: 'page-load',
    name: 'Page load time',
    segment: 'Web',
    unit: 'ms',
    better: 'down',
    base: 1_850,
    weekend: 0.95,
    band: 0.1,
    today: 0.96,
    round: 0,
  },
]

const round = (n: number, places: number) => {
  const f = 10 ** places
  return Math.round(n * f) / f
}

function makeMetric(spec: Spec, seed: number): Metric {
  const next = random(seed)
  const points = dates.map((date, i): Point => {
    const expected = spec.base * (isWeekend(i) ? spec.weekend : 1)
    const past = spec.past?.find(([day]) => day === i)?.[1]
    // Normal days land inside the range, mostly near the middle
    const share =
      i === DAYS - 1
        ? spec.today
        : (past ?? 1 + (next() - 0.5) * spec.band * 1.4)
    return {
      date,
      actual: round(expected * share, spec.round),
      low: round(expected * (1 - spec.band), spec.round),
      high: round(expected * (1 + spec.band), spec.round),
    }
  })
  return {
    id: spec.id,
    name: spec.name,
    segment: spec.segment,
    unit: spec.unit,
    better: spec.better,
    history: points.slice(0, -1),
    today: points[points.length - 1],
  }
}

/** Builds metrics from specs; any dataset in this shape works */
export const makeMetrics = (list: Spec[], seed = 11): Metric[] =>
  list.map((s, i) => makeMetric(s, seed + i))

/** The business example: revenue, latency, conversion and the like */
export const metrics = makeMetrics(specs)
