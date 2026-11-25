<script lang="ts">
  type Props = {
    sku: string
    name: string
    canExpand: boolean
    expanded: boolean
    onToggle: () => void
  }

  let { sku, name, canExpand, expanded, onToggle }: Props = $props()
</script>

{#if canExpand}
  <button
    type="button"
    onclick={onToggle}
    aria-expanded={expanded}
    aria-label="{expanded ? 'Hide' : 'Show'} variants of {name}"
    class="text-sm underline underline-offset-4 hover:text-foreground"
  >
    {expanded ? 'Hide' : 'Show'} variants
  </button>
{:else}
  <span class="font-mono text-xs">{sku}</span>
{/if}
