import { columns } from './columns'
import { ExportSelectedTable } from './data-table'
import { customers } from './data'

export function ExportSelectedDemo() {
  return <ExportSelectedTable columns={columns} data={customers} />
}
