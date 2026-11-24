export type KpiUnit = 'currency' | 'percent' | 'number'

export type Kpi = {
  id: string
  label: string
  value: number
  unit: KpiUnit
  change: number
  trend: number[]
}

export function formatKpiValue(value: number, unit: KpiUnit): string {
  if (unit === 'currency') {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    })
  }
  if (unit === 'percent') {
    return `${value.toFixed(1)}%`
  }
  return value.toLocaleString('en-US')
}
