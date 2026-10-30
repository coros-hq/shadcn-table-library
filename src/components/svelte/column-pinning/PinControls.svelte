<script lang="ts" generics="TData">
  import type { Column } from '@tanstack/table-core'
  import ArrowLeftToLine from '@lucide/svelte/icons/arrow-left-to-line'
  import ArrowRightToLine from '@lucide/svelte/icons/arrow-right-to-line'
  import PinOff from '@lucide/svelte/icons/pin-off'
  import { Button } from '$lib/components/ui/button/index.js'

  let { column }: { column: Column<TData, unknown> } = $props()
</script>

{#if column.getIsPinned()}
  <Button
    type="button"
    variant="ghost"
    size="icon"
    class="size-6 shrink-0 opacity-0 group-hover/head:opacity-100 data-[pinned=true]:opacity-100"
    data-pinned="true"
    aria-label="Unpin {String(column.columnDef.header)} column"
    onclick={() => column.pin(false)}
  >
    <PinOff class="size-3.5" />
  </Button>
{:else}
  <div
    class="flex shrink-0 items-center gap-0.5 opacity-0 group-hover/head:opacity-100"
  >
    <Button
      type="button"
      variant="ghost"
      size="icon"
      class="size-6"
      aria-label="Pin {String(column.columnDef.header)} column left"
      onclick={() => column.pin('left')}
    >
      <ArrowLeftToLine class="size-3.5" />
    </Button>
    <Button
      type="button"
      variant="ghost"
      size="icon"
      class="size-6"
      aria-label="Pin {String(column.columnDef.header)} column right"
      onclick={() => column.pin('right')}
    >
      <ArrowRightToLine class="size-3.5" />
    </Button>
  </div>
{/if}
