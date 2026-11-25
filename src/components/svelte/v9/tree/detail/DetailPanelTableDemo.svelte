<script lang="ts">
  import DetailPanelTable from './DetailPanelTable.svelte'
  import { columns } from './columns'
  import { orders } from './data'

  const data = $state(orders)
</script>

<DetailPanelTable {columns} {data} />
