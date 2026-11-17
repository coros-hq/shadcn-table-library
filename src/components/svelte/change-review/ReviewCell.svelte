<script lang="ts">
  import ChevronRight from '@lucide/svelte/icons/chevron-right'
  import { Badge } from '$lib/components/ui/badge/index.js'
  import type { CatalogRow } from './data'
  import { keysOf, rowState } from './diff'
  import type { Decisions } from './diff'

  let { row, decisions }: { row: CatalogRow; decisions: Decisions } = $props()

  const state = $derived(row.change ? rowState(row.change, decisions) : null)
  const count = $derived(row.change ? keysOf(row.change).length : 0)
  const label = $derived(
    state === 'accepted'
      ? 'Accepted'
      : state === 'rejected'
        ? 'Rejected'
        : state === 'mixed'
          ? 'Partly accepted'
          : row.change?.kind === 'create'
            ? 'New product'
            : row.change?.kind === 'delete'
              ? 'Removal'
              : `${count} change${count === 1 ? '' : 's'}`,
  )
</script>

{#if row.change}
  <div class="flex items-center justify-end gap-1">
    <Badge
      variant="outline"
      class={state === 'pending' || state === 'partial'
        ? 'border-amber-500/50 bg-amber-500/10 text-amber-800 dark:text-amber-300'
        : state === 'accepted'
          ? 'border-emerald-500/40 text-emerald-700 dark:text-emerald-400'
          : 'text-muted-foreground'}
    >
      {label}
    </Badge>
    <ChevronRight class="size-4 text-muted-foreground" />
  </div>
{/if}
