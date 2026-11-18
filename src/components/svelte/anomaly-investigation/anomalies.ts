import type { Metric, Point } from './data'

export type Kind = 'spike' | 'drop' | 'normal'
export type Severity = 'high' | 'medium' | 'low'

/** Above the range is a spike, below it a drop, inside it nothing */
export const kindOf = (p: Point): Kind =>
  p.actual > p.high ? 'spike' : p.actual < p.low ? 'drop' : 'normal'

/** The middle of the expected range */
export const expected = (p: Point) => (p.low + p.high) / 2

/** How far the actual is from the expected value, in percent */
export const change = (p: Point) =>
  ((p.actual - expected(p)) / expected(p)) * 100

/**
 * How far outside the range, measured in half-widths of the range: 0 is
 * inside it, 1 is as far out again as the range is from its middle.
 */
export function distance(p: Point) {
  const half = (p.high - p.low) / 2
  if (p.actual > p.high) return (p.actual - p.high) / half
  if (p.actual < p.low) return (p.low - p.actual) / half
  return 0
}

export function severity(p: Point): Severity | null {
  const d = distance(p)
  if (d === 0) return null
  return d >= 1.5 ? 'high' : d >= 0.5 ? 'medium' : 'low'
}

/** Whether the move is in the direction the metric wants */
export const isGood = (m: Metric) => {
  const kind = kindOf(m.today)
  return kind !== 'normal' && (kind === 'spike') === (m.better === 'up')
}

/** What the move means for this metric */
export const verdict = (m: Metric) =>
  `${isGood(m) ? 'Better' : 'Worse'} than usual`

export type View = 'anomalies' | 'spike' | 'drop' | 'all'

export const views: { id: View; label: string }[] = [
  { id: 'anomalies', label: 'Anomalies' },
  { id: 'spike', label: 'Spikes' },
  { id: 'drop', label: 'Drops' },
  { id: 'all', label: 'All metrics' },
]

export function inView(m: Metric, view: View) {
  const kind = kindOf(m.today)
  if (view === 'all') return true
  if (view === 'anomalies') return kind !== 'normal'
  return kind === view
}

/** The facts beside the chart in the expanded row */
export function context(m: Metric) {
  const last7 = m.history.slice(-7)
  return {
    average7: last7.reduce((s, p) => s + p.actual, 0) / last7.length,
    lastWeek: m.history[m.history.length - 7],
    outside: m.history.filter((p) => kindOf(p) !== 'normal'),
  }
}

/** A value in the metric's unit: "$48,200", "3.40%", "420 ms" */
export function formatValue(n: number, { unit }: Pick<Metric, 'unit'>) {
  switch (unit) {
    case 'currency':
      return n >= 1000
        ? `$${Math.round(n).toLocaleString('en-US')}`
        : `$${n.toFixed(2)}`
    case 'percent':
      return `${n.toFixed(n < 10 ? 2 : 1)}%`
    case 'ms':
      return n >= 1000 ? `${(n / 1000).toFixed(2)} s` : `${Math.round(n)} ms`
    default:
      return Math.round(n).toLocaleString('en-US')
  }
}

export const formatChange = (pct: number) =>
  `${pct > 0 ? '+' : pct < 0 ? '−' : ''}${Math.abs(Math.round(pct))}%`

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

/** "2026-11-04" → "Nov 4", without Date, so time zones can't shift it */
export function formatDay(iso: string) {
  const [, m, d] = iso.split('-').map(Number)
  return `${months[m - 1]} ${d}`
}
