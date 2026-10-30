<script lang="ts">
  import { Badge } from '$lib/components/ui/badge/index.js'
  import type { InvoiceStatus } from './data'

  let { status }: { status: InvoiceStatus } = $props()
</script>

<Badge variant={status === 'Overdue' ? 'destructive' : 'secondary'}>
  {status}
</Badge>
