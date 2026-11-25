<script lang="ts">
  import { salesData } from './data'

  const data = $state(salesData)
  import PivotTable from './PivotTable.svelte'
</script>

<PivotTable {data} />
