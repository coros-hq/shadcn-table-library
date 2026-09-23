import { regions, statuses } from './columns'
import type { Order } from './columns'

export const datePresets = {
  all: { label: 'Any time', days: null },
  '7d': { label: 'Last 7 days', days: 7 },
  '30d': { label: 'Last 30 days', days: 30 },
  '90d': { label: 'Last 90 days', days: 90 },
} as const

export type DatePreset = keyof typeof datePresets
export type ExportFormat = 'csv' | 'excel'

export type ExportConfig = {
  statuses: Order['status'][]
  regions: Order['region'][]
  datePreset: DatePreset
  columns: string[]
  format: ExportFormat
}

export function defaultExportConfig(columnIds: string[]): ExportConfig {
  return {
    statuses: [...statuses],
    regions: [...regions],
    datePreset: 'all',
    columns: columnIds,
    format: 'csv',
  }
}

// One function decides which rows are exported. The dialog's live count and
// the downloaded file both call it, so they can't disagree.
export function applyExportConfig(
  rows: Order[],
  config: ExportConfig,
  today: Date,
): Order[] {
  const days = datePresets[config.datePreset].days
  const from =
    days === null
      ? null
      : new Date(today.getTime() - days * 86_400_000).toISOString().slice(0, 10)

  return rows.filter(
    (row) =>
      config.statuses.includes(row.status) &&
      config.regions.includes(row.region) &&
      (from === null || row.date >= from),
  )
}
