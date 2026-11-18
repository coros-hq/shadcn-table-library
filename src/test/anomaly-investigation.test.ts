import { describe, expect, it } from 'vitest'
import { TODAY, metrics } from '#/components/anomaly-investigation/data'
import { finance } from '#/components/anomaly-investigation/finance'
import type { Point } from '#/components/anomaly-investigation/data'
import {
  change,
  context,
  distance,
  formatChange,
  formatValue,
  inView,
  isGood,
  kindOf,
  severity,
  verdict,
} from '#/components/anomaly-investigation/anomalies'

const byId = (id: string) => metrics.find((m) => m.id === id)!
const point = (actual: number): Point => ({
  date: TODAY,
  actual,
  low: 90,
  high: 110,
})

describe('classifying', () => {
  it('flags values outside the range only', () => {
    expect(kindOf(point(111))).toBe('spike')
    expect(kindOf(point(89))).toBe('drop')
    expect(kindOf(point(110))).toBe('normal')
  })

  it('measures distance in half-widths of the range', () => {
    expect(distance(point(100))).toBe(0)
    expect(distance(point(120))).toBe(1)
    expect(severity(point(112))).toBe('low')
    expect(severity(point(115))).toBe('medium')
    expect(severity(point(70))).toBe('high')
    expect(change(point(120))).toBeCloseTo(20)
  })
})

describe('demo data', () => {
  it('has spikes, drops and normal metrics for today', () => {
    const kinds = metrics.map((m) => kindOf(m.today))
    expect(kinds).toContain('spike')
    expect(kinds).toContain('drop')
    expect(kinds).toContain('normal')
    for (const m of metrics) {
      expect(m.history).toHaveLength(14)
      expect(m.today.date).toBe(TODAY)
    }
  })

  it('reads a spike as good or bad by metric', () => {
    expect(isGood(byId('revenue-us'))).toBe(true)
    expect(isGood(byId('p95-latency'))).toBe(false)
    expect(isGood(byId('checkout-rate'))).toBe(false)
  })

  it('filters by view', () => {
    const spikes = metrics.filter((m) => inView(m, 'spike'))
    const drops = metrics.filter((m) => inView(m, 'drop'))
    const flagged = metrics.filter((m) => inView(m, 'anomalies'))
    expect(spikes.length + drops.length).toBe(flagged.length)
    expect(metrics.filter((m) => inView(m, 'all'))).toHaveLength(metrics.length)
  })

  it('finds earlier days outside the range', () => {
    const latency = context(byId('p95-latency'))
    expect(latency.outside.map((p) => p.date)).toEqual(['2026-11-10'])
    expect(latency.lastWeek.date).toBe('2026-11-11')
    expect(context(byId('orders')).outside).toEqual([])
  })
})

describe('formatting', () => {
  it('formats by unit', () => {
    expect(formatValue(48_200, { unit: 'currency' })).toBe('$48,200')
    expect(formatValue(64.5, { unit: 'currency' })).toBe('$64.50')
    expect(formatValue(3.4, { unit: 'percent' })).toBe('3.40%')
    expect(formatValue(38, { unit: 'percent' })).toBe('38.0%')
    expect(formatValue(420, { unit: 'ms' })).toBe('420 ms')
    expect(formatValue(1850, { unit: 'ms' })).toBe('1.85 s')
    expect(formatChange(-29.4)).toBe('−29%')
    expect(formatChange(62)).toBe('+62%')
  })
})

describe('finance example', () => {
  it('has spikes, drops and normal lines, all in dollars', () => {
    const kinds = finance.map((m) => kindOf(m.today))
    expect(kinds).toContain('spike')
    expect(kinds).toContain('drop')
    expect(kinds).toContain('normal')
    expect(finance.every((m) => m.unit === 'currency')).toBe(true)
    const cash = finance.find((m) => m.id === 'cash-balance')!
    expect(formatValue(cash.today.actual, cash)).toMatch(/^\$1,\d{3},\d{3}$/)
  })

  it('reads a drop in costs as better and in income as worse', () => {
    const ads = finance.find((m) => m.id === 'ad-spend')!
    expect(kindOf(ads.today)).toBe('drop')
    expect(verdict(ads)).toBe('Better than usual')
    const invoices = finance.find((m) => m.id === 'invoices-collected')!
    expect(kindOf(invoices.today)).toBe('drop')
    expect(verdict(invoices)).toBe('Worse than usual')
    const chargebacks = finance.find((m) => m.id === 'chargebacks')!
    expect(severity(chargebacks.today)).toBe('high')
  })
})
