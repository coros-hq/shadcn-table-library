<script lang="ts">
  import VariantsTable from './VariantsTable.svelte'
  import { columns } from './columns'
  import { products } from './data'

  const data = $state(products)
</script>

<VariantsTable {columns} {data} />
