import { columns } from './columns'
import type { OrgNode } from './columns'
import { TreeDataTable } from './data-table'

const data: OrgNode[] = [
  {
    id: 'engineering',
    name: 'Engineering',
    role: 'Department',
    status: '—',
    children: [
      {
        id: 'frontend',
        name: 'Frontend',
        role: 'Team',
        status: '—',
        children: [
          {
            id: 'ava',
            name: 'Ava Thompson',
            role: 'Frontend Lead',
            status: 'Active',
          },
          {
            id: 'liam',
            name: 'Liam Chen',
            role: 'Frontend Engineer',
            status: 'Active',
          },
        ],
      },
      {
        id: 'backend',
        name: 'Backend',
        role: 'Team',
        status: '—',
        children: [
          {
            id: 'sofia',
            name: 'Sofia Patel',
            role: 'Backend Lead',
            status: 'Active',
          },
          {
            id: 'noah',
            name: 'Noah Garcia',
            role: 'Backend Engineer',
            status: 'Inactive',
          },
        ],
      },
    ],
  },
  {
    id: 'design',
    name: 'Design',
    role: 'Department',
    status: '—',
    children: [
      {
        id: 'product-design',
        name: 'Product Design',
        role: 'Team',
        status: '—',
        children: [
          {
            id: 'mia',
            name: 'Mia Johnson',
            role: 'Design Lead',
            status: 'Active',
          },
          {
            id: 'ethan',
            name: 'Ethan Kim',
            role: 'Product Designer',
            status: 'Pending',
          },
        ],
      },
    ],
  },
]

export function TreeTableDemo() {
  return <TreeDataTable columns={columns} data={data} />
}
