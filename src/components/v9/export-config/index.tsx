import { columns } from './columns'
import { ExportConfigTable } from './data-table'
import { orders, today } from './data'

export function ExportConfigDemo() {
  return <ExportConfigTable columns={columns} data={orders} today={today} />
}
