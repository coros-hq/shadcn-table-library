<script lang="ts">
  import { columns } from './columns'
  import LogsSidePanelTable from './LogsSidePanelTable.svelte'
  import { logs } from './data'
</script>

<LogsSidePanelTable {columns} data={logs} />
