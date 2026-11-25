import { onMount } from 'svelte'

function readParam(key: string) {
  if (typeof window === 'undefined') return ''
  return new URLSearchParams(window.location.search).get(key) ?? ''
}

function writeParam(key: string, value: string) {
  const url = new URL(window.location.href)
  if (value) {
    url.searchParams.set(key, value)
  } else {
    url.searchParams.delete(key)
  }
  window.history.replaceState(null, '', url)
}

/**
 * Filter state synced to the URL via the native URLSearchParams + History
 * API — no router dependency required. With SvelteKit, swap this for a
 * function that reads `page.url.searchParams` and writes with `goto`;
 * `ParamsDataTable` only sees two bindable props, so nothing else changes.
 */
export function useUrlFilters() {
  let search = $state(readParam('q'))
  let role = $state(readParam('role'))

  $effect(() => writeParam('q', search))
  $effect(() => writeParam('role', role))

  function syncFromUrl() {
    search = readParam('q')
    role = readParam('role')
  }

  onMount(() => {
    syncFromUrl()
    window.addEventListener('popstate', syncFromUrl)
    return () => window.removeEventListener('popstate', syncFromUrl)
  })

  return {
    get search() {
      return search
    },
    set search(value: string) {
      search = value
    },
    get role() {
      return role
    },
    set role(value: string) {
      role = value
    },
  }
}
