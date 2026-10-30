<script lang="ts" generics="TData">
  import type { Column } from '@tanstack/table-core'
  import MultiSelectFilter from './MultiSelectFilter.svelte'

  type Props = {
    column?: Column<TData, unknown>
    title: string
    options: string[]
  }

  let { column, title, options }: Props = $props()

  // Counts come from the faceted model, which ignores this column's own filter,
  // so the numbers stay meaningful while you are still picking options.
  const facetedOptions = $derived.by(() => {
    const facets = column?.getFacetedUniqueValues()
    return options.map((option) => ({
      label: option,
      value: option,
      count: facets?.get(option) ?? 0,
    }))
  })

  const selected = $derived((column?.getFilterValue() as string[] | undefined) ?? [])

  // An empty array would still count as an active filter and hide every row,
  // so clearing the last option removes the filter entirely.
  function onChange(values: string[]) {
    column?.setFilterValue(values.length ? values : undefined)
  }
</script>

<MultiSelectFilter {title} options={facetedOptions} bind:selected={() => selected, onChange} />
