<script lang="ts">
  import VariantsTable from './VariantsTable.svelte'
  import { columns } from './columns'
  import { products } from './data'
</script>

<VariantsTable {columns} data={products} />
