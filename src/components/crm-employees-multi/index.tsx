import { columns } from './columns'
import { DataTable } from './data-table'
import { departments, employees, statuses } from './data'

export function CrmEmployeesMultiTableDemo() {
  return (
    <DataTable
      columns={columns}
      data={employees}
      departments={departments}
      statuses={statuses}
    />
  )
}
