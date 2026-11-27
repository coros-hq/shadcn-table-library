<script lang="ts">
  import { Badge } from '$lib/components/ui/badge/index.js'
  import { cn } from '$lib/utils.js'
  import type { StockStatus } from './formulas'

  const statusStyles: Record<StockStatus, string> = {
    Short: 'bg-red-500/10 text-red-700 dark:text-red-400',
    Reorder: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    Healthy: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  }

  let { status }: { status: StockStatus } = $props()
</script>

<Badge variant="outline" class={cn('border-transparent', statusStyles[status])}>
  {status}
</Badge>
