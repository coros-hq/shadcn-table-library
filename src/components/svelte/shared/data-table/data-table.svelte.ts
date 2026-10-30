import {
  createTable,
  type RowData,
  type TableOptions,
  type TableOptionsResolved,
  type TableState,
} from '@tanstack/table-core'

/**
 * Merges objects without reading their values, so getters (reactive `$state`
 * reads) stay live instead of being copied once.
 */
export function mergeObjects<T extends object>(...sources: any[]): T {
  const target: Record<string, unknown> = {}
  for (const source of sources) {
    const resolved = typeof source === 'function' ? source() : source
    if (!resolved) continue
    for (const key of Object.keys(Object.getOwnPropertyDescriptors(resolved))) {
      if (key in target) continue
      Object.defineProperty(target, key, {
        enumerable: true,
        get() {
          for (let i = sources.length - 1; i >= 0; i--) {
            const s = typeof sources[i] === 'function' ? sources[i]() : sources[i]
            const value = s?.[key]
            if (value !== undefined) return value
          }
        },
      })
    }
  }
  return target as T
}

/**
 * Svelte 5 adapter for @tanstack/table-core v8. Pass options with getters
 * (`get data() { return rows }`) so the table follows reactive values.
 */
export function createSvelteTable<TData extends RowData>(
  options: TableOptions<TData>,
) {
  const resolvedOptions: TableOptionsResolved<TData> = mergeObjects(
    {
      state: {},
      onStateChange() {},
      renderFallbackValue: null,
      mergeOptions: (defaults: object, overrides: object) =>
        mergeObjects(defaults, overrides),
    },
    options,
  )

  const table = createTable(resolvedOptions)
  let state = $state<Partial<TableState>>(table.initialState)

  function updateOptions() {
    table.setOptions((prev) =>
      mergeObjects(prev, options, {
        // Read `state` lazily so templates subscribe to the variable itself and
        // re-render when TanStack's internal updater replaces it
        state: mergeObjects(() => state, options.state || {}),
        onStateChange: (updater: any) => {
          if (updater instanceof Function) state = updater(state)
          else state = mergeObjects(state, updater)
          options.onStateChange?.(updater)
        },
      }),
    )
  }

  updateOptions()
  $effect.pre(() => {
    updateOptions()
  })

  return table
}
