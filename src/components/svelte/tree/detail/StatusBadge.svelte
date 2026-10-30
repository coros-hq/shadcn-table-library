<script lang="ts">
  import { Badge } from '$lib/components/ui/badge/index.js'
  import { statusStyle } from './columns'
  import type { OrderStatus, ShipmentStatus } from './data'

  let { status }: { status: OrderStatus | ShipmentStatus } = $props()
</script>

<Badge variant="secondary" class={statusStyle[status]}>{status}</Badge>
