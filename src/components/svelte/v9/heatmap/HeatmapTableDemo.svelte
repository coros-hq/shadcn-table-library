<script lang="ts">
  import { months, revenueByRegion } from './data'
  import HeatmapTable from './HeatmapTable.svelte'
</script>

<HeatmapTable
  columns={months}
  data={revenueByRegion}
  formatValue={(value) => `$${value}k`}
/>
