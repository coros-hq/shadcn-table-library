<script lang="ts">
  import { cn } from '$lib/utils.js'

  let { marginPct, className }: { marginPct: number; className?: string } =
    $props()
</script>

<span class={cn('tabular-nums', className)}>{marginPct.toFixed(1)}%</span>
