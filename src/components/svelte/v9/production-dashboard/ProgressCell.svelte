<script lang="ts">
  import { cn } from '$lib/utils.js'
  import ProgressBar from './ProgressBar.svelte'

  type Props = {
    value: number
    barClassName?: string
    /** Left text above the bar (only in the default, two-label layout) */
    label?: string
    sublabel: string
    /** Single muted label above the bar instead of label + sublabel */
    stacked?: boolean
    class?: string
  }

  let {
    value,
    barClassName,
    label,
    sublabel,
    stacked = false,
    class: className,
  }: Props = $props()
</script>

<div class={cn('space-y-1.5', className)}>
  {#if stacked}
    <p class="text-xs tabular-nums text-muted-foreground">{sublabel}</p>
  {:else}
    <div class="flex items-center justify-between text-xs tabular-nums">
      <span>{label}</span>
      <span class="text-muted-foreground">{sublabel}</span>
    </div>
  {/if}
  <ProgressBar {value} {barClassName} />
</div>
