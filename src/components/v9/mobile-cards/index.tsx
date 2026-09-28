import { columns, type Order } from './columns'
import { DataTable } from './data-table'
import { ViewportToggle } from './viewport-toggle'

const data: Order[] = [
  { id: '#1042', customer: 'Ava Thompson', date: 'Aug 12, 2026', status: 'Paid', total: '$284.00' },
  { id: '#1041', customer: 'Liam Chen', date: 'Aug 11, 2026', status: 'Pending', total: '$96.50' },
  { id: '#1040', customer: 'Sofia Patel', date: 'Aug 11, 2026', status: 'Paid', total: '$412.20' },
  { id: '#1039', customer: 'Noah Garcia', date: 'Aug 10, 2026', status: 'Refunded', total: '$58.00' },
  { id: '#1038', customer: 'Mia Johnson', date: 'Aug 09, 2026', status: 'Paid', total: '$129.99' },
  { id: '#1037', customer: 'Ethan Kim', date: 'Aug 08, 2026', status: 'Pending', total: '$74.30' },
]

export function MobileCardsTableDemo() {
  return (
    <ViewportToggle>
      <DataTable columns={columns} data={data} />
    </ViewportToggle>
  )
}
