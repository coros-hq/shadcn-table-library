import { describe, expect, it } from 'vitest'
import { PERIODS, cohorts } from '#/components/cohort-retention/data'
import {
  averages,
  cellAt,
  compare,
  formatPercent,
  intensity,
  needsLightText,
} from '#/components/cohort-retention/cohorts'

describe('data', () => {
  it('has one cohort per month, each one month younger', () => {
    expect(cohorts).toHaveLength(PERIODS)
    cohorts.forEach((c, i) => {
      expect(c.retained).toHaveLength(PERIODS - i)
      expect(c.retained[0]).toBe(c.size)
      // Nobody comes back after leaving in this demo, so it never rises
      c.retained.forEach((n, k) => {
        if (k) expect(n).toBeLessThanOrEqual(c.retained[k - 1])
      })
    })
  })
})

describe('cellAt', () => {
  it('tells a month not reached from a real zero', () => {
    const [launch] = cohorts
    expect(cellAt(launch, 10)).toEqual({ kind: 'value', count: 0, percent: 0 })
    const newest = cohorts.at(-1)!
    expect(cellAt(newest, 1)).toEqual({ kind: 'unavailable' })
    expect(cellAt(newest, 0)).toMatchObject({ kind: 'value', percent: 100 })
  })
})

describe('averages', () => {
  it('weights by cohort size over the cohorts that reached the month', () => {
    const avg = averages(cohorts)
    const reached = cohorts.filter((c) => c.retained.length > 3)
    const users = reached.reduce((s, c) => s + c.size, 0)
    const kept = reached.reduce((s, c) => s + c.retained[3], 0)
    expect(avg[3]).toMatchObject({ cohorts: reached.length, users })
    expect(avg[3]!.percent).toBeCloseTo((kept / users) * 100)
    expect(avg[0]!.percent).toBe(100)
  })

  it('leaves out a month only one cohort has reached', () => {
    expect(averages(cohorts)[11]).toBeNull()
    expect(averages(cohorts)[10]?.cohorts).toBe(2)
  })
})

describe('display', () => {
  it('scales color to 60% and formats small values', () => {
    expect(intensity(30)).toBeCloseTo(0.5)
    expect(intensity(100)).toBe(1)
    expect(needsLightText(100)).toBe(true)
    expect(needsLightText(20)).toBe(false)
    expect(formatPercent(0)).toBe('0%')
    expect(formatPercent(0.4)).toBe('<1%')
    expect(formatPercent(31.4)).toBe('31%')
  })

  it('compares a cohort with the average', () => {
    const mar = cohorts.find((c) => c.id === '2026-03')!
    expect(compare(mar, cohorts)).toMatch(/^Mar 2026: \d+ of 680 users/)
    expect(compare(cohorts.at(-1)!, cohorts)).toMatch(/no retention to compare/)
  })
})
