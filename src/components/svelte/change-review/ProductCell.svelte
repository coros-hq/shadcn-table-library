<script lang="ts">
  import type { CatalogRow } from './data'
  import { changedFields } from './diff'

  type Props = {
    row: CatalogRow
    /** Opens the diff panel; only rows with changes have one */
    onopen: () => void
  }

  let { row, onopen }: Props = $props()

  const renamed = $derived(
    row.change?.kind === 'update' && changedFields(row.change).includes('name'),
  )
</script>

{#snippet name()}
  <span class="flex items-center gap-2 font-medium">
    {row.product.name}
    {#if renamed}
      <span
        title="Changes in this update"
        class="size-1.5 shrink-0 rounded-full bg-amber-500"
      ></span>
    {/if}
    {#if row.change?.kind === 'create'}
      <span class="text-xs font-normal text-emerald-700 dark:text-emerald-400"
        >new</span
      >
    {/if}
  </span>
{/snippet}

<div class="flex min-w-36 flex-col gap-0.5">
  {#if row.change}
    <!-- A real button, so the panel opens from the keyboard too -->
    <button
      type="button"
      data-review-id={row.id}
      onclick={(e) => {
        e.stopPropagation()
        onopen()
      }}
      class="rounded-sm text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      aria-label="Review changes to {row.product.name}"
    >
      {@render name()}
    </button>
  {:else}
    {@render name()}
  {/if}
  <span class="font-mono text-xs text-muted-foreground">{row.product.sku}</span>
</div>
