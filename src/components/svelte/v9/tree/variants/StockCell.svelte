<script lang="ts">
  import { cn } from '$lib/utils.js'
  import type { StockStatus } from './data'

  const statusDot: Record<StockStatus, string> = {
    Ready: 'bg-emerald-500',
    Low: 'bg-amber-500',
    Backorder: 'bg-red-500',
  }

  const number = new Intl.NumberFormat('en-US')

  let { stock, status }: { stock: number; status: StockStatus } = $props()
</script>

<span class="inline-flex items-center gap-2 whitespace-nowrap tabular-nums">
  {number.format(stock)}
  <span class="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
    <span aria-hidden="true" class={cn('size-1.5 rounded-full', statusDot[status])}></span>
    {status}
  </span>
</span>
