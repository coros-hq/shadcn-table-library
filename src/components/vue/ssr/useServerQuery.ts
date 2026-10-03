import { ref, watch } from 'vue'

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
  const result = ref<R>(initial)
  const isPending = ref(false)
  let latest = 0

  watch(
    params,
    async (next) => {
      const id = ++latest
      isPending.value = true
      try {
        const data = await fetcher({ ...next })
        if (id === latest) result.value = data as typeof result.value
      } finally {
        if (id === latest) isPending.value = false
      }
    },
    { immediate: true, deep: true },
  )

  return { result, isPending }
}
