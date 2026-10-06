import { computed, onMounted, ref } from 'vue'
import type { Ref } from 'vue'

export type InfinitePage<T> = {
  rows: T[]
  nextCursor: number | null
}

export type InfiniteStatus = 'idle' | 'loading' | 'error'

// Accumulates pages from a cursor-based fetcher
export function useInfiniteRows<T>(
  fetchPage: (cursor: number) => Promise<InfinitePage<T>>,
) {
  const rows = ref([]) as Ref<T[]>
  const status = ref<InfiniteStatus>('idle')
  const hasMore = ref(true)
  let cursor: number | null = 0
  // Plain flag, not a ref: two observer callbacks can fire before a re-render
  let inFlight = false

  async function loadMore() {
    if (inFlight || cursor === null) return
    inFlight = true
    status.value = 'loading'
    try {
      const page = await fetchPage(cursor)
      cursor = page.nextCursor
      rows.value = [...rows.value, ...page.rows]
      hasMore.value = page.nextCursor !== null
      status.value = 'idle'
    } catch {
      status.value = 'error'
    } finally {
      inFlight = false
    }
  }

  onMounted(loadMore)

  const canAutoLoad = computed(() => hasMore.value && status.value === 'idle')

  return { rows, status, hasMore, canAutoLoad, loadMore }
}
