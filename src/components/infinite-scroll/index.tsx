import { InfiniteScrollTable } from './data-table'
import { TOTAL, fetchTransactions } from './data'

export function InfiniteScrollDemo() {
  return <InfiniteScrollTable fetchPage={fetchTransactions} total={TOTAL} />
}
