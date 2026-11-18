<script lang="ts">
  import TriangleAlert from '@lucide/svelte/icons/triangle-alert'
  import X from '@lucide/svelte/icons/x'
  import { Button } from '$lib/components/ui/button/index.js'
  import type { DraftMeta, DraftRow } from './types'

  // The duplicate warning and the remove button at the end of a draft row
  let { row, meta }: { row: DraftRow; meta: DraftMeta } = $props()
</script>

<div class="flex items-center justify-end gap-1">
  {#if meta.duplicates.has(row.id)}
    <span
      title="Same date, amount and description as another expense"
      class="flex items-center gap-1 text-xs whitespace-nowrap text-amber-700 dark:text-amber-400"
    >
      <TriangleAlert aria-hidden="true" class="size-3.5" />
      Duplicate?
    </span>
  {/if}
  <Button
    variant="ghost"
    size="icon"
    class="size-8"
    disabled={meta.saving}
    aria-label="Remove new row {row.number}"
    onclick={() => meta.remove(row.id)}
  >
    <X />
  </Button>
</div>
