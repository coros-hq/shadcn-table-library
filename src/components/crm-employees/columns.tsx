'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '#/components/ui/badge'
import { Checkbox } from '#/components/ui/checkbox'
import { cn } from '#/lib/utils.ts'
import type { Department, Employee, EmployeeStatus } from './data'

const statusClassName: Record<EmployeeStatus, string> = {
  Active:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
  Remote: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300',
  'On leave':
    'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  Probation:
    'bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300',
}

const departmentDot: Record<Department, string> = {
  Engineering: 'bg-blue-500',
  Design: 'bg-pink-500',
  Sales: 'bg-emerald-500',
  Marketing: 'bg-orange-500',
  Finance: 'bg-teal-500',
  'People Ops': 'bg-violet-500',
  Support: 'bg-amber-500',
}

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

// Dates are stored as ISO strings; formatting in UTC keeps the server and the
// browser from disagreeing about which day it is.
const dateFormat = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
})

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
}

// A fixed "today" keeps tenure stable across renders and between server and
// client; swap it for Date.now() in a real app.
const REFERENCE_DATE = Date.UTC(2025, 9, 1)

function tenure(hireDate: string) {
  const months = Math.max(
    0,
    Math.floor(
      (REFERENCE_DATE - new Date(`${hireDate}T00:00:00Z`).getTime()) /
        (1000 * 60 * 60 * 24 * 30.44),
    ),
  )
  const years = Math.floor(months / 12)
  return years > 0 ? `${years}y ${months % 12}m` : `${months}m`
}

export const columns: ColumnDef<Employee>[] = [
  {
    id: 'select',
    enableSorting: false,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all rows on this page"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label={`Select ${row.original.name}`}
      />
    ),
  },
  {
    accessorKey: 'name',
    header: 'Employee',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground"
        >
          {initials(row.original.name)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {row.original.email}
          </p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => (
      <div>
        <p>{row.original.role}</p>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            aria-hidden
            className={cn(
              'size-1.5 rounded-full',
              departmentDot[row.original.department],
            )}
          />
          {row.original.department}
        </p>
      </div>
    ),
  },
  {
    // Hidden in the table (shown under Role instead) but kept as a real column
    // so the toolbar can filter on it.
    accessorKey: 'department',
    header: 'Department',
    filterFn: 'equalsString',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    filterFn: 'equalsString',
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={cn(
          'border-transparent',
          statusClassName[row.original.status],
        )}
      >
        {row.original.status}
      </Badge>
    ),
  },
  { accessorKey: 'location', header: 'Location' },
  { accessorKey: 'manager', header: 'Manager' },
  {
    accessorKey: 'hireDate',
    header: 'Hired',
    cell: ({ row }) => (
      <div className="tabular-nums">
        <p>
          {dateFormat.format(new Date(`${row.original.hireDate}T00:00:00Z`))}
        </p>
        <p className="text-xs text-muted-foreground">
          {tenure(row.original.hireDate)}
        </p>
      </div>
    ),
  },
  {
    accessorKey: 'performance',
    header: 'Performance',
    cell: ({ row }) => (
      <div
        role="img"
        aria-label={`${row.original.performance} out of 5`}
        className="flex gap-0.5"
      >
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className={cn(
              'h-1.5 w-4 rounded-full',
              i < row.original.performance ? 'bg-primary' : 'bg-muted',
            )}
          />
        ))}
      </div>
    ),
  },
  {
    accessorKey: 'salary',
    header: () => <div className="text-right">Salary</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium tabular-nums">
        {currency.format(row.original.salary)}
      </div>
    ),
  },
]
