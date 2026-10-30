<script lang="ts">
  import { columns } from './columns'
  import ExportSelectedTable from './ExportSelectedTable.svelte'
  import { customers } from './data'
</script>

<ExportSelectedTable {columns} data={customers} />
