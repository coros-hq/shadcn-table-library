export type TransactionStatus = 'paid' | 'pending' | 'refunded' | 'failed'

export type Transaction = {
  id: string
  customer: string
  email: string
  amount: number
  status: TransactionStatus
  createdAt: string
}

export type Page = {
  rows: Transaction[]
  /** Offset of the next page, or null once the last page has been served */
  nextCursor: number | null
}

export const TOTAL = 240
export const PAGE_SIZE = 25

const FIRST = ['Ava', 'Liam', 'Noor', 'Mateo', 'Yuki', 'Sofia', 'Omar', 'Ines']
const LAST = ['Rivera', 'Chen', 'Haddad', 'Novak', 'Okafor', 'Silva', 'Berg']
const STATUSES: TransactionStatus[] = ['paid', 'paid', 'paid', 'pending', 'refunded', 'failed']

function makeTransaction(index: number): Transaction {
  const first = FIRST[index % FIRST.length]
  const last = LAST[(index * 3) % LAST.length]
  const minutesAgo = index * 47 + (index % 5) * 9
  return {
    id: `TX-${String(10_000 + TOTAL - index)}`,
    customer: `${first} ${last}`,
    email: `${first}.${last}@example.com`.toLowerCase(),
    amount: ((index * 3731) % 48_000) / 100 + 9.5,
    status: STATUSES[(index * 5) % STATUSES.length],
    createdAt: new Date(Date.UTC(2026, 9, 6, 12) - minutesAgo * 60_000).toISOString(),
  }
}

// Demo only: the first request for this offset fails, so the retry state is
// visible. Reloading the page resets it.
const FAILING_CURSOR = 100
let hasFailed = false

/** Stands in for `GET /transactions?cursor=…` against a real API */
export async function fetchTransactions(cursor: number): Promise<Page> {
  await new Promise((resolve) => setTimeout(resolve, 700))

  if (cursor === FAILING_CURSOR && !hasFailed) {
    hasFailed = true
    throw new Error('Request failed')
  }

  const end = Math.min(cursor + PAGE_SIZE, TOTAL)
  const rows = Array.from({ length: end - cursor }, (_, i) =>
    makeTransaction(cursor + i),
  )
  return { rows, nextCursor: end < TOTAL ? end : null }
}
