<script lang="ts">
  import ArrowDown from '@lucide/svelte/icons/arrow-down'
  import ArrowUp from '@lucide/svelte/icons/arrow-up'
  import type { Column } from '@tanstack/table-core'
  import { cn } from '$lib/utils.js'
  import type { Entry } from './data'

  type Props = {
    column: Column<Entry>
    label: string
    align?: 'left' | 'right'
  }

  let { column, label, align = 'left' }: Props = $props()

  const sorted = $derived(column.getIsSorted())
  const Icon = $derived(sorted === 'desc' ? ArrowDown : ArrowUp)
</script>

<div class="flex">
  <button
    type="button"
    onclick={column.getToggleSortingHandler()}
    class={cn(
      'group/sort inline-flex items-center gap-1 rounded-sm outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50',
      align === 'right' && 'ml-auto flex-row-reverse',
    )}
  >
    {label}
    <Icon
      aria-hidden="true"
      class={cn('size-3.5', !sorted && 'opacity-0 group-hover/sort:opacity-40')}
    />
  </button>
</div>
