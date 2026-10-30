<script lang="ts">
  import Check from '@lucide/svelte/icons/check'
  import X from '@lucide/svelte/icons/x'
  import type { FeatureValue } from './comparison'

  let { value }: { value: FeatureValue } = $props()
</script>

<div class="text-center">
  {#if typeof value === 'boolean'}
    {#if value}
      <Check class="mx-auto h-4 w-4 text-emerald-600 dark:text-emerald-500" />
    {:else}
      <X class="mx-auto h-4 w-4 text-muted-foreground/40" />
    {/if}
  {:else}
    {value}
  {/if}
</div>
