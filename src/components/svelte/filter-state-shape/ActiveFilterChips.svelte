<script lang="ts">
  import { format } from 'date-fns'
  import X from '@lucide/svelte/icons/x'
  import { Badge } from '$lib/components/ui/badge/index.js'
  import { Button } from '$lib/components/ui/button/index.js'
  import type { ActiveFilter } from './type'

  type Props = {
    filters: ActiveFilter[]
    onremove: (columnId: string) => void
    onclearall: () => void
  }

  let { filters, onremove, onclearall }: Props = $props()

  function formatFilterLabel(f: ActiveFilter) {
    if (f.type === 'dateRange') {
      return `${f.columnId}: ${f.from ? format(f.from, 'MMM d') : '?'} - ${f.to ? format(f.to, 'MMM d') : '?'}`
    }
    return `${f.columnId}: ${f.values.join(', ')}`
  }
</script>

{#if filters.length > 0}
  <div class="flex flex-wrap items-center gap-2">
    {#each filters as f (f.columnId)}
      <Badge variant="secondary" class="gap-1 pr-1">
        {formatFilterLabel(f)}
        <button
          type="button"
          aria-label="Remove {f.columnId} filter"
          onclick={() => onremove(f.columnId)}
        >
          <X class="h-3 w-3" />
        </button>
      </Badge>
    {/each}
    <Button variant="ghost" size="sm" onclick={onclearall}>Clear all</Button>
  </div>
{/if}
