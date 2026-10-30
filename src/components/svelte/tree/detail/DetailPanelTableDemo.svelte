<script lang="ts">
  import DetailPanelTable from './DetailPanelTable.svelte'
  import { columns } from './columns'
  import { orders } from './data'
</script>

<DetailPanelTable {columns} data={orders} />
