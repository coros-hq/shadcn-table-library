<script lang="ts">
  import { Badge } from '$lib/components/ui/badge/index.js'
  import type { Order } from './columns'

  const statusVariant: Record<
    Order['status'],
    'default' | 'secondary' | 'outline' | 'destructive'
  > = {
    Paid: 'default',
    Pending: 'secondary',
    Refunded: 'outline',
    Failed: 'destructive',
  }

  let { status }: { status: Order['status'] } = $props()
</script>

<Badge variant={statusVariant[status]}>{status}</Badge>
