import { onMount } from 'svelte'

export type InfinitePage<T> = {
  rows: T[]
  nextCursor: number | null
}

export type InfiniteStatus = 'idle' | 'loading' | 'error'

// Accumulates pages from a cursor-based fetcher
export function useInfiniteRows<T>(
  fetchPage: (cursor: number) => Promise<InfinitePage<T>>,
) {
  let rows = $state<T[]>([])
  let status = $state<InfiniteStatus>('idle')
  let hasMore = $state(true)
  let cursor: number | null = 0
  // Plain flag, not state: two observer callbacks can fire before a re-render
  let inFlight = false

  async function loadMore() {
    if (inFlight || cursor === null) return
    inFlight = true
    status = 'loading'
    try {
      const page = await fetchPage(cursor)
      cursor = page.nextCursor
      rows = [...rows, ...page.rows]
      hasMore = page.nextCursor !== null
      status = 'idle'
    } catch {
      status = 'error'
    } finally {
      inFlight = false
    }
  }

  onMount(loadMore)

  return {
    get rows() {
      return rows
    },
    get status() {
      return status
    },
    get hasMore() {
      return hasMore
    },
    get canAutoLoad() {
      return hasMore && status === 'idle'
    },
    loadMore,
  }
}
