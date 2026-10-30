<script lang="ts">
  import ChevronRight from '@lucide/svelte/icons/chevron-right'
  import { cn } from '$lib/utils.js'

  let {
    label,
    count,
    expanded,
    onToggle,
  }: {
    label: string
    count: number
    expanded: boolean
    onToggle: () => void
  } = $props()
</script>

<button type="button" onclick={onToggle} class="flex items-center gap-1.5 font-medium">
  <ChevronRight
    class={cn('h-3.5 w-3.5 transition-transform', expanded && 'rotate-90')}
  />
  {label}
  <span class="font-normal text-muted-foreground">({count})</span>
</button>
