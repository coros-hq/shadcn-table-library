import { columns } from './columns'
import type { Task } from './columns'
import { FilterStateShapeDataTable } from './data-table'

const categoryOptions = [
  { label: 'Design', value: 'Design' },
  { label: 'Engineering', value: 'Engineering' },
  { label: 'Marketing', value: 'Marketing' },
]

const data: Task[] = [
  {
    id: 'tsk-1',
    title: 'Redesign onboarding flow',
    category: 'Design',
    priority: 'High',
    status: 'In Progress',
    dueDate: new Date('2026-08-05'),
  },
  {
    id: 'tsk-2',
    title: 'Fix pagination bug on export',
    category: 'Engineering',
    priority: 'High',
    status: 'Open',
    dueDate: new Date('2026-08-08'),
  },
  {
    id: 'tsk-3',
    title: 'Write Q3 newsletter draft',
    category: 'Marketing',
    priority: 'Low',
    status: 'Done',
    dueDate: new Date('2026-07-28'),
  },
  {
    id: 'tsk-4',
    title: 'Audit component color tokens',
    category: 'Design',
    priority: 'Medium',
    status: 'Open',
    dueDate: new Date('2026-08-15'),
  },
  {
    id: 'tsk-5',
    title: 'Migrate auth to new session store',
    category: 'Engineering',
    priority: 'High',
    status: 'In Progress',
    dueDate: new Date('2026-08-20'),
  },
  {
    id: 'tsk-6',
    title: 'Plan launch landing page copy',
    category: 'Marketing',
    priority: 'Medium',
    status: 'Open',
    dueDate: new Date('2026-08-01'),
  },
  {
    id: 'tsk-7',
    title: 'Ship dark mode for settings page',
    category: 'Design',
    priority: 'Medium',
    status: 'Done',
    dueDate: new Date('2026-07-22'),
  },
  {
    id: 'tsk-8',
    title: 'Add rate limiting to public API',
    category: 'Engineering',
    priority: 'High',
    status: 'Open',
    dueDate: new Date('2026-08-25'),
  },
  {
    id: 'tsk-9',
    title: 'Set up A/B test for pricing page',
    category: 'Marketing',
    priority: 'Low',
    status: 'In Progress',
    dueDate: new Date('2026-08-12'),
  },
  {
    id: 'tsk-10',
    title: 'Review accessibility on data table',
    category: 'Design',
    priority: 'Medium',
    status: 'Open',
    dueDate: new Date('2026-08-18'),
  },
  {
    id: 'tsk-11',
    title: 'Optimize bundle size for docs site',
    category: 'Engineering',
    priority: 'Medium',
    status: 'Done',
    dueDate: new Date('2026-07-30'),
  },
  {
    id: 'tsk-12',
    title: 'Coordinate partner co-marketing post',
    category: 'Marketing',
    priority: 'Low',
    status: 'Done',
    dueDate: new Date('2026-08-10'),
  },
]

export function FilterStateShapeTableDemo() {
  return (
    <FilterStateShapeDataTable
      columns={columns}
      data={data}
      categoryOptions={categoryOptions}
    />
  )
}
