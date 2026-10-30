<script lang="ts">
  import { cn } from '$lib/utils.js'

  let { performance }: { performance: number } = $props()
</script>

<div role="img" aria-label="{performance} out of 5" class="flex gap-0.5">
  {#each { length: 5 } as _, i (i)}
    <span class={cn('h-1.5 w-4 rounded-full', i < performance ? 'bg-primary' : 'bg-muted')}></span>
  {/each}
</div>
