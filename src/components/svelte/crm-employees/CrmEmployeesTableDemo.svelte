<script lang="ts">
  import { columns } from './columns'
  import { departments, employees, statuses } from './data'
  import DataTable from './DataTable.svelte'
</script>

<DataTable {columns} data={employees} {departments} {statuses} />
