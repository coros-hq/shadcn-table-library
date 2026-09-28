import { columns } from './columns'
import type { Employee } from './columns'
import { UtilityTable } from './data-table'

const data: Employee[] = [
  { id: '1', name: 'Ava Thompson', email: 'ava.t@example.com', role: 'Admin', status: 'Active' },
  { id: '2', name: 'Liam Chen', email: 'liam.chen@example.com', role: 'Editor', status: 'Active' },
  { id: '3', name: 'Sofia Patel', email: 'sofia.p@example.com', role: 'Viewer', status: 'Inactive' },
  { id: '4', name: 'Noah Garcia', email: 'noah.g@example.com', role: 'Editor', status: 'Active' },
  { id: '5', name: 'Mia Johnson', email: 'mia.j@example.com', role: 'Admin', status: 'Pending' },
  { id: '6', name: 'Ethan Kim', email: 'ethan.kim@example.com', role: 'Viewer', status: 'Active' },
]

export function UtilityTableDemo() {
  return <UtilityTable columns={columns} data={data} />
}
