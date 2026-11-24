import { untrack } from 'svelte'

/**
 * Re-runs `fetcher` whenever `params` changes and exposes the latest result.
 * The previous rows stay on screen while the next request is pending, so the
 * table dims instead of flashing empty. Responses that arrive out of order
 * are dropped.
 */
export function useServerQuery<P, R extends { rows: unknown[] }>(
  params: () => P,
  fetcher: (params: P) => Promise<R>,
  initial: R,
) {
  let result = $state.raw<R>(initial)
  let isPending = $state(false)
  let latest = 0

  $effect(() => {
    // Reading `params()` here is what subscribes this effect to the query
    const next = { ...params() }
    const id = ++latest
    isPending = true
    untrack(async () => {
      try {
        const data = await fetcher(next)
        if (id === latest) result = data
      } finally {
        if (id === latest) isPending = false
      }
    })
  })

  return {
    get result() {
      return result
    },
    get isPending() {
      return isPending
    },
  }
}
