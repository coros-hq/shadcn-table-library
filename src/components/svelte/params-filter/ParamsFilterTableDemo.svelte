<script lang="ts">
  import { columns } from './columns'
  import type { TeamMember } from './columns'
  import ParamsDataTable from './ParamsDataTable.svelte'
  import { useUrlFilters } from './useUrlFilters.svelte'

  const data: TeamMember[] = [
    { id: '1', name: 'Amelia Frost', email: 'amelia@acme.dev', role: 'Engineering' },
    { id: '2', name: 'Noah Park', email: 'noah@acme.dev', role: 'Design' },
    { id: '3', name: 'Sofia Reyes', email: 'sofia@acme.dev', role: 'Product' },
    { id: '4', name: 'Liam Chen', email: 'liam@acme.dev', role: 'Engineering' },
    { id: '5', name: 'Maya Okafor', email: 'maya@acme.dev', role: 'Support' },
  ]

  const roleOptions = [...new Set(data.map((member) => member.role))]

  const filters = useUrlFilters()
</script>

<ParamsDataTable
  {columns}
  {data}
  {roleOptions}
  bind:search={filters.search}
  bind:role={filters.role}
/>
