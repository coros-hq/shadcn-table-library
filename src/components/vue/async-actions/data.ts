export type SyncStatus = 'synced' | 'syncing' | 'failed'

export type Source = {
  id: string
  name: string
  kind: string
  status: SyncStatus
  /** Minutes since the last successful sync */
  lastSyncedMin: number
  error?: string
  /** Demo only: the next sync attempt fails, the retry after it succeeds */
  failsNext?: boolean
}

export const initialSources: Source[] = [
  {
    id: 'pg-prod',
    name: 'Postgres — production',
    kind: 'Database',
    status: 'synced',
    lastSyncedMin: 3,
  },
  {
    id: 'stripe',
    name: 'Stripe',
    kind: 'Payments',
    status: 'synced',
    lastSyncedMin: 12,
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    kind: 'CRM',
    status: 'failed',
    lastSyncedMin: 95,
    error: 'Token expired',
  },
  {
    id: 's3-logs',
    name: 'S3 — event logs',
    kind: 'Storage',
    status: 'synced',
    lastSyncedMin: 41,
    failsNext: true,
  },
  {
    id: 'segment',
    name: 'Segment',
    kind: 'Analytics',
    status: 'synced',
    lastSyncedMin: 7,
  },
  {
    id: 'zendesk',
    name: 'Zendesk',
    kind: 'Support',
    status: 'synced',
    lastSyncedMin: 180,
  },
]

export function formatLastSynced(minutes: number): string {
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  return `${hours} h ago`
}
