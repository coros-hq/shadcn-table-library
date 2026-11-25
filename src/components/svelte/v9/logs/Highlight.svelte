<script lang="ts">
  /** Wraps every case-insensitive match of `query` in a <mark> */
  let { text, query }: { text: string; query: string } = $props()

  const parts = $derived.by(() => {
    const q = query.trim()
    if (!q) return [text]
    return text.split(
      new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
    )
  })
</script>

{#each parts as part, i (i)}
  {#if i % 2 === 1}
    <mark class="rounded-[2px] bg-yellow-300/60 text-foreground dark:bg-yellow-500/40">{part}</mark>
  {:else}
    {part}
  {/if}
{/each}
