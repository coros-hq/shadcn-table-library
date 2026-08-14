'use client'

import { useQueryState } from 'nuqs'

/**
 * Filter state synced to the URL via nuqs. Same shape as
 * `useNativeFilters` — swap one for the other without touching
 * `ParamsDataTable`.
 */
export function useNuqsFilters() {
  const [search, setSearch] = useQueryState('q', { defaultValue: '' })
  const [role, setRole] = useQueryState('role', { defaultValue: '' })

  return {
    search,
    role,
    setSearch: (value: string) => setSearch(value || null),
    setRole: (value: string) => setRole(value || null),
  }
}
