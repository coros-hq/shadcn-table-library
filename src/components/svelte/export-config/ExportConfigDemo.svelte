<script lang="ts">
  import { columns } from './columns'
  import ExportConfigTable from './ExportConfigTable.svelte'
  import { orders, today } from './data'
</script>

<ExportConfigTable {columns} data={orders} {today} />
