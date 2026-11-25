<script lang="ts">
  import { columns } from './columns'
  import LogsTable from './LogsTable.svelte'
  import { logs } from './data'

  const data = $state(logs)
</script>

<LogsTable {columns} {data} />
