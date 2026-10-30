<script lang="ts">
  import { columns } from './columns'
  import DeploymentsTable from './DeploymentsTable.svelte'
  import { deployments } from './data'
</script>

<DeploymentsTable {columns} data={deployments} />
