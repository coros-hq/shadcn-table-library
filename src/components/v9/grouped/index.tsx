import { columns } from './columns'
import type { Order } from './columns'
import { GroupedDataTable } from './data-table'

const data: Order[] = [
  { id: 'ord-1', customer: 'Ava Thompson', category: 'Electronics', amount: 249.99, status: 'Paid' },
  { id: 'ord-2', customer: 'Liam Chen', category: 'Electronics', amount: 79.5, status: 'Paid' },
  { id: 'ord-3', customer: 'Sofia Patel', category: 'Electronics', amount: 1099.0, status: 'Pending' },
  { id: 'ord-4', customer: 'Noah Garcia', category: 'Clothing', amount: 45.0, status: 'Paid' },
  { id: 'ord-5', customer: 'Mia Johnson', category: 'Clothing', amount: 120.75, status: 'Refunded' },
  { id: 'ord-6', customer: 'Ethan Kim', category: 'Clothing', amount: 32.2, status: 'Paid' },
  { id: 'ord-7', customer: 'Isabella Rossi', category: 'Clothing', amount: 58.0, status: 'Pending' },
  { id: 'ord-8', customer: 'Lucas Martin', category: 'Home', amount: 310.4, status: 'Paid' },
  { id: 'ord-9', customer: 'Amelia Novak', category: 'Home', amount: 89.99, status: 'Paid' },
]

export function GroupedTableDemo() {
  return <GroupedDataTable columns={columns} data={data} groupBy="category" />
}
