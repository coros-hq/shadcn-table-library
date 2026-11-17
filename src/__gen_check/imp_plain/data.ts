export type Row = {
  id: string
  name: string
  plan: string
  seats: number | null
  renews: string
  active: boolean
  meta: string
}

// Your imported rows. Swap them for a fetch from your API when you are ready.
export const rows: Row[] = [
  {
    id: '1',
    name: 'Ada',
    plan: 'Pro',
    seats: 12,
    renews: '2025-09-01',
    active: true,
    meta: '{"a":1}',
  },
  {
    id: '2',
    name: 'Alan',
    plan: 'Free',
    seats: null,
    renews: '2025-03-15',
    active: false,
    meta: 'x',
  },
  {
    id: '3',
    name: 'Grace',
    plan: 'Pro',
    seats: 4,
    renews: '',
    active: true,
    meta: 'y',
  },
  {
    id: '4',
    name: 'Bob',
    plan: 'Free',
    seats: 3,
    renews: '2025-01-01',
    active: false,
    meta: 'z',
  },
]
