<script lang="ts">
  import { cn } from '$lib/utils.js'

  let { name, muted = false }: { name: string; muted?: boolean } = $props()
</script>

<span class={cn('block max-w-44 truncate', muted && 'text-muted-foreground')} title={name}>
  {name}
</span>
