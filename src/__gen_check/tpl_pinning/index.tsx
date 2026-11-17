import { columns } from './columns'
import { DataTable } from './data-table'
import { rows } from './data'

export function MyTable() {
  // Set this while your data is being fetched
  const isLoading = false

  return (
    <DataTable
      columns={columns}
      data={rows}
      isLoading={isLoading}
    />
  )
}
