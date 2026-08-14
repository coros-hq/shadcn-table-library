'use client'

import { useCallback, useEffect, useState } from 'react'

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
 * API — no router-specific dependency required. Same shape as
 * `useNuqsFilters` — swap one for the other without touching
 * `ParamsDataTable`.
 */
export function useNativeFilters() {
  const [search, setSearchState] = useState(() => readParam('q'))
  const [role, setRoleState] = useState(() => readParam('role'))

  useEffect(() => {
    setSearchState(readParam('q'))
    setRoleState(readParam('role'))

    const onPopState = () => {
      setSearchState(readParam('q'))
      setRoleState(readParam('role'))
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const setSearch = useCallback((value: string) => {
    setSearchState(value)
    writeParam('q', value)
  }, [])

  const setRole = useCallback((value: string) => {
    setRoleState(value)
    writeParam('role', value)
  }, [])

  return { search, role, setSearch, setRole }
}
