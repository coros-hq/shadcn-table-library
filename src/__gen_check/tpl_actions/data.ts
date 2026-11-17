export type Row = {
  id: string
  name: string
  kind: string
  status: string
  last_synced: number
}

// Sample data. Replace it with your own rows (or a fetch) of the same shape.
export const rows: Row[] = [
  {
    id: '1',
    name: 'Website redesign',
    kind: 'Payments',
    status: 'Failed',
    last_synced: 315,
  },
  {
    id: '2',
    name: 'Q3 campaign',
    kind: 'Database',
    status: 'Syncing',
    last_synced: 7490,
  },
  {
    id: '3',
    name: 'Onboarding flow',
    kind: 'Storage',
    status: 'Synced',
    last_synced: 4765,
  },
  {
    id: '4',
    name: 'Billing migration',
    kind: 'CRM',
    status: 'Failed',
    last_synced: 2040,
  },
  {
    id: '5',
    name: 'Mobile app',
    kind: 'Payments',
    status: 'Syncing',
    last_synced: 9215,
  },
  {
    id: '6',
    name: 'Help center',
    kind: 'Database',
    status: 'Synced',
    last_synced: 6490,
  },
  {
    id: '7',
    name: 'Pricing page',
    kind: 'Storage',
    status: 'Failed',
    last_synced: 3765,
  },
  {
    id: '8',
    name: 'Data pipeline',
    kind: 'CRM',
    status: 'Syncing',
    last_synced: 1040,
  },
  {
    id: '9',
    name: 'Brand refresh',
    kind: 'Payments',
    status: 'Synced',
    last_synced: 8215,
  },
  {
    id: '10',
    name: 'Partner portal',
    kind: 'Database',
    status: 'Failed',
    last_synced: 5490,
  },
  {
    id: '11',
    name: 'Search upgrade',
    kind: 'Storage',
    status: 'Syncing',
    last_synced: 2765,
  },
  {
    id: '12',
    name: 'Accessibility audit',
    kind: 'CRM',
    status: 'Synced',
    last_synced: 9940,
  },
]
