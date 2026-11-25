import { regions, statuses } from './columns'
import type { Order } from './columns'

// Fixed "today" so date presets give the same result on server and client.
export const today = new Date('2026-09-23T00:00:00Z')

const customers = [
  'Ava Thompson',
  'Liam Chen',
  'Sofia Patel',
  'Noah Garcia',
  'Mia Johnson',
  'Ethan Kim',
  'Isabella Rossi',
  'Lucas Martin',
  'Amelia Novak',
  'Mason Lee',
]

// Small deterministic PRNG, so the demo data never changes between renders.
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const random = mulberry32(42)
const pick = <T>(items: readonly T[]) =>
  items[Math.floor(random() * items.length)]

export const orders: Order[] = Array.from({ length: 30 }, (_, i) => {
  const daysAgo = Math.floor(random() * 120)
  const date = new Date(today.getTime() - daysAgo * 86_400_000)
  return {
    id: `ORD-${String(1001 + i)}`,
    customer: pick(customers),
    region: pick(regions),
    status: pick(statuses),
    date: date.toISOString().slice(0, 10),
    amount: Math.round((20 + random() * 980) * 100) / 100,
  }
}).sort((a, b) => b.date.localeCompare(a.date))
