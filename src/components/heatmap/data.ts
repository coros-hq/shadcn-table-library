import type { HeatmapRow } from './heatmap'

export const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

export const revenueByRegion: HeatmapRow[] = [
  { label: 'North', values: { Jan: 42, Feb: 45, Mar: 40, Apr: 51, May: 58, Jun: 63 } },
  { label: 'South', values: { Jan: 31, Feb: 33, Mar: 29, Apr: 38, May: 41, Jun: 44 } },
  { label: 'East', values: { Jan: 55, Feb: 59, Mar: 52, Apr: 67, May: 74, Jun: 81 } },
  { label: 'West', values: { Jan: 38, Feb: 41, Mar: 36, Apr: 46, May: 50, Jun: 55 } },
]
