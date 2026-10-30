<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js'
  import DataTable from './DataTable.svelte'
  import { invoices } from './data'
  import type { Invoice } from './data'

  let data = $state<Invoice[]>([])
</script>

<div class="space-y-3">
  <div class="flex flex-wrap gap-2">
    <Button
      variant="outline"
      size="sm"
      disabled={data.length === 0}
      onclick={() => (data = [])}
    >
      Empty the table
    </Button>
    <Button
      variant="outline"
      size="sm"
      disabled={data.length > 0}
      onclick={() => (data = invoices)}
    >
      Load invoices
    </Button>
  </div>
  <DataTable {data} oncreate={() => (data = invoices)} />
</div>
