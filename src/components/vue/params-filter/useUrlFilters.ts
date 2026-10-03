import { onMounted, onUnmounted, ref, watch } from 'vue'

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
 * API — no router dependency required. With vue-router, swap this for a
 * composable that reads `route.query` and writes with `router.replace`;
 * `ParamsDataTable` only sees two v-model refs, so nothing else changes.
 */
export function useUrlFilters() {
  const search = ref(readParam('q'))
  const role = ref(readParam('role'))

  watch(search, (value) => writeParam('q', value))
  watch(role, (value) => writeParam('role', value))

  function syncFromUrl() {
    search.value = readParam('q')
    role.value = readParam('role')
  }

  onMounted(() => {
    syncFromUrl()
    window.addEventListener('popstate', syncFromUrl)
  })
  onUnmounted(() => window.removeEventListener('popstate', syncFromUrl))

  return { search, role }
}
