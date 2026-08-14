import { columns, type TeamMember } from './columns'
import { ParamsDataTable } from './data-table'
import { useNuqsFilters } from './use-nuqs-filters'
// Prefer no extra dependency? Swap the import/hook above for:
// import { useNativeFilters as useNuqsFilters } from './use-native-filters'

const data: TeamMember[] = [
  { id: '1', name: 'Amelia Frost', email: 'amelia@acme.dev', role: 'Engineering' },
  { id: '2', name: 'Noah Park', email: 'noah@acme.dev', role: 'Design' },
  { id: '3', name: 'Sofia Reyes', email: 'sofia@acme.dev', role: 'Product' },
  { id: '4', name: 'Liam Chen', email: 'liam@acme.dev', role: 'Engineering' },
  { id: '5', name: 'Maya Okafor', email: 'maya@acme.dev', role: 'Support' },
]

const roleOptions = [...new Set(data.map((member) => member.role))]

export function ParamsFilterTableDemo() {
  const { search, role, setSearch, setRole } = useNuqsFilters()

  return (
    <ParamsDataTable
      columns={columns}
      data={data}
      roleOptions={roleOptions}
      search={search}
      onSearchChange={setSearch}
      role={role}
      onRoleChange={setRole}
    />
  )
}
