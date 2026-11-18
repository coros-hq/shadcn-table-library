<script lang="ts">
  // Plain text with its own classes, and an optional muted line under it
  let {
    text,
    note,
    class: className = '',
  }: { text: string; note?: string; class?: string } = $props()
</script>

{#if note}
  <span class="flex flex-col">
    <span class={className}>{text}</span>
    <span class="text-xs font-normal text-muted-foreground">{note}</span>
  </span>
{:else}
  <span class={className}>{text}</span>
{/if}
