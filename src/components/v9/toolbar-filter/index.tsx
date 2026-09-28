import { columns } from './columns'
import type { Task } from './columns'
import { ToolbarFilterDataTable } from './data-table'

const categoryOptions = [
  { label: 'Design', value: 'Design' },
  { label: 'Engineering', value: 'Engineering' },
  { label: 'Marketing', value: 'Marketing' },
]

const statusOptions = [
  { label: 'Open', value: 'Open' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Done', value: 'Done' },
]

const data: Task[] = [
  {
    id: 'tsk-1',
    title: 'Redesign onboarding flow',
    category: 'Design',
    priority: 'High',
    status: 'In Progress',
  },
  {
    id: 'tsk-2',
    title: 'Fix pagination bug on export',
    category: 'Engineering',
    priority: 'High',
    status: 'Open',
  },
  {
    id: 'tsk-3',
    title: 'Write Q3 newsletter draft',
    category: 'Marketing',
    priority: 'Low',
    status: 'Done',
  },
  {
    id: 'tsk-4',
    title: 'Audit component color tokens',
    category: 'Design',
    priority: 'Medium',
    status: 'Open',
  },
  {
    id: 'tsk-5',
    title: 'Migrate auth to new session store',
    category: 'Engineering',
    priority: 'High',
    status: 'In Progress',
  },
  {
    id: 'tsk-6',
    title: 'Plan launch landing page copy',
    category: 'Marketing',
    priority: 'Medium',
    status: 'Open',
  },
  {
    id: 'tsk-7',
    title: 'Ship dark mode for settings page',
    category: 'Design',
    priority: 'Medium',
    status: 'Done',
  },
  {
    id: 'tsk-8',
    title: 'Add rate limiting to public API',
    category: 'Engineering',
    priority: 'High',
    status: 'Open',
  },
  {
    id: 'tsk-9',
    title: 'Set up A/B test for pricing page',
    category: 'Marketing',
    priority: 'Low',
    status: 'In Progress',
  },
  {
    id: 'tsk-10',
    title: 'Review accessibility on data table',
    category: 'Design',
    priority: 'Medium',
    status: 'Open',
  },
  {
    id: 'tsk-11',
    title: 'Optimize bundle size for docs site',
    category: 'Engineering',
    priority: 'Medium',
    status: 'Done',
  },
  {
    id: 'tsk-12',
    title: 'Coordinate partner co-marketing post',
    category: 'Marketing',
    priority: 'Low',
    status: 'Done',
  },
]

export function ToolbarFilterTableDemo() {
  return (
    <ToolbarFilterDataTable
      columns={columns}
      data={data}
      categoryOptions={categoryOptions}
      statusOptions={statusOptions}
    />
  )
}
