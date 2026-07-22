import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { columns } from './columns'
import { DataTable } from './data-table'
import type { User } from '#/components/basic/columns'

const data: User[] = [
  {
    id: 1,
    name: 'Ava Thompson',
    email: 'ava.t@example.com',
    role: 'Admin',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Liam Chen',
    email: 'liam.chen@example.com',
    role: 'Editor',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Sofia Patel',
    email: 'sofia.p@example.com',
    role: 'Viewer',
    status: 'Inactive',
  },
  {
    id: 4,
    name: 'Noah Garcia',
    email: 'noah.g@example.com',
    role: 'Editor',
    status: 'Active',
  },
  {
    id: 5,
    name: 'Mia Johnson',
    email: 'mia.j@example.com',
    role: 'Admin',
    status: 'Pending',
  },
  {
    id: 6,
    name: 'Ethan Kim',
    email: 'ethan.kim@example.com',
    role: 'Viewer',
    status: 'Active',
  },
  {
    id: 7,
    name: 'Isabella Rossi',
    email: 'isabella.r@example.com',
    role: 'Editor',
    status: 'Active',
  },
  {
    id: 8,
    name: 'Lucas Martin',
    email: 'lucas.m@example.com',
    role: 'Admin',
    status: 'Inactive',
  },
  {
    id: 9,
    name: 'Amelia Novak',
    email: 'amelia.n@example.com',
    role: 'Viewer',
    status: 'Active',
  },
  {
    id: 10,
    name: 'Mason Lee',
    email: 'mason.lee@example.com',
    role: 'Editor',
    status: 'Pending',
  },
  {
    id: 11,
    name: 'Charlotte Diaz',
    email: 'charlotte.d@example.com',
    role: 'Admin',
    status: 'Active',
  },
  {
    id: 12,
    name: 'James Wilson',
    email: 'james.w@example.com',
    role: 'Viewer',
    status: 'Active',
  },
  {
    id: 13,
    name: 'Harper Nguyen',
    email: 'harper.n@example.com',
    role: 'Editor',
    status: 'Inactive',
  },
  {
    id: 14,
    name: 'Benjamin Cruz',
    email: 'ben.cruz@example.com',
    role: 'Admin',
    status: 'Active',
  },
  {
    id: 15,
    name: 'Ella Fischer',
    email: 'ella.f@example.com',
    role: 'Viewer',
    status: 'Pending',
  },
  {
    id: 16,
    name: 'Alexander Reed',
    email: 'alex.reed@example.com',
    role: 'Editor',
    status: 'Active',
  },
  {
    id: 17,
    name: 'Grace Coleman',
    email: 'grace.c@example.com',
    role: 'Admin',
    status: 'Active',
  },
  {
    id: 18,
    name: 'Daniel Torres',
    email: 'daniel.t@example.com',
    role: 'Viewer',
    status: 'Inactive',
  },
  {
    id: 19,
    name: 'Chloe Bennett',
    email: 'chloe.b@example.com',
    role: 'Editor',
    status: 'Active',
  },
  {
    id: 20,
    name: 'Henry Brooks',
    email: 'henry.b@example.com',
    role: 'Admin',
    status: 'Pending',
  },
  {
    id: 21,
    name: 'Zoe Sanders',
    email: 'zoe.s@example.com',
    role: 'Viewer',
    status: 'Active',
  },
  {
    id: 22,
    name: 'Sebastian Ortiz',
    email: 'sebastian.o@example.com',
    role: 'Editor',
    status: 'Active',
  },
  {
    id: 23,
    name: 'Layla Morgan',
    email: 'layla.m@example.com',
    role: 'Admin',
    status: 'Inactive',
  },
  {
    id: 24,
    name: 'Jack Foster',
    email: 'jack.f@example.com',
    role: 'Viewer',
    status: 'Active',
  },
  {
    id: 25,
    name: 'Victoria Hayes',
    email: 'victoria.h@example.com',
    role: 'Editor',
    status: 'Pending',
  },
]

export function BasicTableUsage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Table Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={data} />
      </CardContent>
    </Card>
  )
}
