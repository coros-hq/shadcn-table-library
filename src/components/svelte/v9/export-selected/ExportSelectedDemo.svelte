<script lang="ts">
  import { columns } from './columns'
  import ExportSelectedTable from './ExportSelectedTable.svelte'
  import { customers } from './data'

  const data = $state(customers)
</script>

<ExportSelectedTable {columns} {data} />
