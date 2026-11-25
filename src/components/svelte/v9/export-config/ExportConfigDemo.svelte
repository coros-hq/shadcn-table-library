<script lang="ts">
  import { columns } from './columns'
  import ExportConfigTable from './ExportConfigTable.svelte'
  import { orders, today } from './data'

  const data = $state(orders)
</script>

<ExportConfigTable {columns} {data} {today} />
