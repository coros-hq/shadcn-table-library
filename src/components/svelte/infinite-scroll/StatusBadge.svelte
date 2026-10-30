<script lang="ts">
  import { Badge } from '$lib/components/ui/badge/index.js'
  import { cn } from '$lib/utils.js'
  import type { TransactionStatus } from './data'

  const statusStyle: Record<TransactionStatus, string> = {
    paid: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    pending: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    refunded: 'bg-sky-500/10 text-sky-700 dark:text-sky-400',
    failed: 'bg-red-500/10 text-red-700 dark:text-red-400',
  }

  let { status }: { status: TransactionStatus } = $props()
</script>

<Badge variant="secondary" class={cn('capitalize', statusStyle[status])}>
  {status}
</Badge>
