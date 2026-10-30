<script lang="ts">
  import { columns } from './columns'
  import LogsTable from './LogsTable.svelte'
  import { logs } from './data'
</script>

<LogsTable {columns} data={logs} />
