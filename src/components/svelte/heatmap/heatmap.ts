export type HeatmapRow = {
  label: string
  values: Record<string, number>
}

const HEAT_RGB = '37, 99, 235' // Tailwind blue-600
const MIN_ALPHA = 0.08
const MAX_ALPHA = 0.8
const DARK_TEXT_THRESHOLD = 0.5

export function getHeatmapRange(rows: HeatmapRow[], columns: string[]) {
  let min = Infinity
  let max = -Infinity
  for (const row of rows) {
    for (const col of columns) {
      const value = row.values[col]
      if (value < min) min = value
      if (value > max) max = value
    }
  }
  return { min, max }
}

export function getHeatColor(value: number, min: number, max: number) {
  const range = max - min || 1
  const alpha = MIN_ALPHA + ((value - min) / range) * (MAX_ALPHA - MIN_ALPHA)
  return {
    backgroundColor: `rgba(${HEAT_RGB}, ${alpha.toFixed(2)})`,
    isDark: alpha > DARK_TEXT_THRESHOLD,
  }
}
