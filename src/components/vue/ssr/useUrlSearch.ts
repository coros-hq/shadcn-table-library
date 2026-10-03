import { onMounted, onUnmounted, reactive } from 'vue'

type Primitive = string | number

/**
 * Keeps table state (page, filters, sort…) in the URL query string, so a
 * bookmark or refresh reproduces the exact same view. Each key's type comes
 * from its default: numbers are parsed back to numbers, and a value equal to
 * its default is left out of the URL.
 *
 * Uses the native History API. With vue-router, replace this with a
 * composable over `route.query` and `router.push` — the tables only see
 * `search` and `navigate`.
 */
export function useUrlSearch<T extends Record<string, Primitive>>(defaults: T) {
  const read = (): T => {
    const params = new URLSearchParams(window.location.search)
    const next: Record<string, Primitive> = {}
    for (const [key, fallback] of Object.entries(defaults)) {
      const raw = params.get(key)
      next[key] =
        raw === null
          ? fallback
          : typeof fallback === 'number'
            ? Number(raw)
            : raw
    }
    return next as T
  }

  // Read the URL up front so a deep link fetches the right page straight away;
  // the browser check keeps this safe to render on a server
  const search = reactive(
    typeof window === 'undefined' ? { ...defaults } : read(),
  ) as T

  const sync = () => Object.assign(search, read())

  // Same-tab navigation changes the URL without a popstate, so write then re-read
  function navigate(patch: Partial<T> | ((prev: T) => Partial<T>)) {
    const next = {
      ...search,
      ...(typeof patch === 'function' ? patch({ ...search }) : patch),
    }
    const url = new URL(window.location.href)
    for (const [key, fallback] of Object.entries(defaults)) {
      const value = next[key]
      if (value === fallback || value === '') url.searchParams.delete(key)
      else url.searchParams.set(key, String(value))
    }
    window.history.pushState(null, '', url)
    sync()
  }

  onMounted(() => {
    sync()
    window.addEventListener('popstate', sync)
  })
  onUnmounted(() => window.removeEventListener('popstate', sync))

  return { search, navigate }
}
