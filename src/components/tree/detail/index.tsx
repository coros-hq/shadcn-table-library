import { columns } from './columns'
import { orders } from './data'
import { DetailPanelTable } from './data-table'

export function DetailPanelTableDemo() {
  return <DetailPanelTable columns={columns} data={orders} />
}
