<script lang="ts">
  import { columns } from './columns'
  import LogsSidePanelTable from './LogsSidePanelTable.svelte'
  import { logs } from './data'

  const data = $state(logs)
</script>

<LogsSidePanelTable {columns} {data} />
