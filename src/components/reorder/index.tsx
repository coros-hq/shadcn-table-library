import { useState } from 'react'

import { columns } from './columns'
import type { Task } from './columns'
import { ReorderableTable } from './data-table'

const initialData: Task[] = [
  { id: 'task-1', title: 'Design landing page', priority: 'High', status: 'In progress' },
  { id: 'task-2', title: 'Set up CI pipeline', priority: 'Medium', status: 'Todo' },
  { id: 'task-3', title: 'Write onboarding docs', priority: 'Low', status: 'Todo' },
  { id: 'task-4', title: 'Fix pagination bug', priority: 'High', status: 'In progress' },
  { id: 'task-5', title: 'Add dark mode toggle', priority: 'Medium', status: 'Done' },
  { id: 'task-6', title: 'Audit accessibility', priority: 'Low', status: 'Todo' },
]

export function ReorderableTableDemo() {
  const [data, setData] = useState(initialData)

  return <ReorderableTable columns={columns} data={data} onDataChange={setData} />
}
