import { PERIODS } from './data'
import type { Cohort } from './data'

export type Mode = 'percent' | 'count'

/** One cell: a month the cohort hasn't reached yet, or its retention */
export type Cell =
  { kind: 'unavailable' } | { kind: 'value'; count: number; percent: number }

export function cellAt(cohort: Cohort, period: number): Cell {
  const count = cohort.retained.at(period)
  if (period >= cohort.retained.length || count === undefined)
    return { kind: 'unavailable' }
  return { kind: 'value', count, percent: (count / cohort.size) * 100 }
}

/**
 * Average retention per month, weighted by cohort size, over the cohorts
 * that have reached that month. Null when fewer than two have: one cohort's
 * number isn't an average, and a single small cohort would make it swing.
 */
export function averages(list: Cohort[]) {
  return Array.from({ length: PERIODS }, (_, period) => {
    const reached = list.filter((c) => period < c.retained.length)
    if (reached.length < 2) return null
    const users = reached.reduce((sum, c) => sum + c.size, 0)
    const kept = reached.reduce((sum, c) => sum + c.retained[period], 0)
    return {
      count: kept,
      users,
      percent: (kept / users) * 100,
      cohorts: reached.length,
    }
  })
}

/**
 * How strong a cell's color is, 0 to 1. Retention after month 0 sits
 * between 0 and about 50%, so the scale tops out at 60% to keep those
 * differences visible; month 0's 100% simply saturates.
 */
export const intensity = (percent: number) => Math.min(percent, 60) / 60

/** Dark text on light cells, light text on strong ones */
export const needsLightText = (percent: number) => intensity(percent) > 0.55

export const formatPercent = (p: number) =>
  p === 0 ? '0%' : p < 1 ? '<1%' : `${Math.round(p)}%`

export const formatCount = (n: number) => n.toLocaleString('en-US')

/**
 * A sentence comparing a cohort with the average at month 3, or at the
 * latest month it has reached if it's younger than that
 */
export function compare(cohort: Cohort, list: Cohort[]) {
  const period = Math.min(3, cohort.retained.length - 1)
  if (period < 1) {
    return `${cohort.label} signed up this month (${formatCount(cohort.size)} users), so there is no retention to compare yet.`
  }
  const own = cellAt(cohort, period)
  const avg = averages(list)[period]
  if (own.kind !== 'value' || !avg) return ''
  const diff = Math.round(own.percent) - Math.round(avg.percent)
  const versus =
    diff === 0
      ? 'the same as the average'
      : `${Math.abs(diff)} ${Math.abs(diff) === 1 ? 'point' : 'points'} ${diff > 0 ? 'above' : 'below'} the average of ${formatPercent(avg.percent)}`
  return `${cohort.label}: ${formatCount(own.count)} of ${formatCount(cohort.size)} users (${formatPercent(own.percent)}) were still active in month ${period}, ${versus}.`
}
