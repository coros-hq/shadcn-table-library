<script lang="ts">
  import { columns } from './columns'
  import DeploymentsTable from './DeploymentsTable.svelte'
  import { deployments } from './data'

  const data = $state(deployments)
</script>

<DeploymentsTable {columns} {data} />
