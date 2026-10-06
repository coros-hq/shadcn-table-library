'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type InfinitePage<T> = {
  rows: T[]
  nextCursor: number | null
}

export type InfiniteStatus = 'idle' | 'loading' | 'error'

/**
 * Accumulates pages from a cursor-based fetcher. `fetchPage` must be a stable
 * reference (module-level or memoized), or the first page is requested again
 * on every render.
 */
export function useInfiniteRows<T>(
  fetchPage: (cursor: number) => Promise<InfinitePage<T>>,
) {
  const [rows, setRows] = useState<T[]>([])
  const [status, setStatus] = useState<InfiniteStatus>('idle')
  const [hasMore, setHasMore] = useState(true)
  const cursor = useRef<number | null>(0)
  // A ref, not state: two observer callbacks can fire before a re-render
  const inFlight = useRef(false)

  const loadMore = useCallback(async () => {
    if (inFlight.current || cursor.current === null) return
    inFlight.current = true
    setStatus('loading')
    try {
      const page = await fetchPage(cursor.current)
      cursor.current = page.nextCursor
      setRows((prev) => [...prev, ...page.rows])
      setHasMore(page.nextCursor !== null)
      setStatus('idle')
    } catch {
      setStatus('error')
    } finally {
      inFlight.current = false
    }
  }, [fetchPage])

  useEffect(() => {
    void loadMore()
  }, [loadMore])

  return { rows, status, hasMore, loadMore }
}
