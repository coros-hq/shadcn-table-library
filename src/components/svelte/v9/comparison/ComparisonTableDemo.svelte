<script lang="ts">
  import { features, plans } from './data'
  import ComparisonTable from './ComparisonTable.svelte'
</script>

<ComparisonTable {plans} {features} />
