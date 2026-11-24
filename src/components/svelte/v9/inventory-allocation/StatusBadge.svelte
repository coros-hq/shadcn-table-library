<script lang="ts">
  import { Badge } from '$lib/components/ui/badge/index.js'
  import { cn } from '$lib/utils.js'
  import type { StockStatus } from './formulas'

  const statusStyles: Record<StockStatus, string> = {
    Short: 'bg-destructive/15 text-destructive dark:bg-destructive/25 dark:text-red-300',
    Reorder: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
    Healthy: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
  }

  let { status }: { status: StockStatus } = $props()
</script>

<Badge variant="outline" class={cn('border-transparent', statusStyles[status])}>
  {status}
</Badge>
