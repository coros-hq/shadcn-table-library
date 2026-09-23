import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type {
  ColumnDef,
  ExpandedState,
  SortingState,
} from '@tanstack/react-table'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronRight,
  Search,
} from 'lucide-react'
import { cn } from '#/lib/utils.ts'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table.tsx'

type SpendNode = {
  id: string
  name: string
  status?: 'Healthy' | 'Degraded' | 'Down'
  cost?: number
  prevCost?: number
  children?: SpendNode[]
}

const data: SpendNode[] = [
  {
    id: 'platform',
    name: 'Platform',
    children: [
      {
        id: 'compute',
        name: 'Compute',
        children: [
          {
            id: 'api-gateway',
            name: 'api-gateway',
            status: 'Healthy',
            cost: 4210,
            prevCost: 4090,
          },
          {
            id: 'workers',
            name: 'workers',
            status: 'Healthy',
            cost: 2880,
            prevCost: 3130,
          },
        ],
      },
      {
        id: 'data',
        name: 'Data',
        children: [
          {
            id: 'postgres',
            name: 'postgres',
            status: 'Degraded',
            cost: 3640,
            prevCost: 3250,
          },
          {
            id: 'redis',
            name: 'redis',
            status: 'Healthy',
            cost: 610,
            prevCost: 610,
          },
        ],
      },
    ],
  },
  {
    id: 'product',
    name: 'Product',
    children: [
      {
        id: 'web-app',
        name: 'web-app',
        status: 'Healthy',
        cost: 1920,
        prevCost: 1850,
      },
      {
        id: 'search',
        name: 'search',
        status: 'Healthy',
        cost: 1380,
        prevCost: 1140,
      },
      {
        id: 'notifications',
        name: 'notifications',
        status: 'Down',
        cost: 460,
        prevCost: 540,
      },
    ],
  },
  {
    id: 'ml',
    name: 'Machine Learning',
    children: [
      {
        id: 'inference',
        name: 'inference',
        status: 'Healthy',
        cost: 5300,
        prevCost: 3960,
      },
      {
        id: 'training',
        name: 'training',
        status: 'Healthy',
        cost: 2150,
        prevCost: 2310,
      },
    ],
  },
]

// Parent rows roll up their leaves, so totals stay correct at every depth.
function sum(node: SpendNode, key: 'cost' | 'prevCost'): number {
  return node.children
    ? node.children.reduce((n, child) => n + sum(child, key), 0)
    : (node[key] ?? 0)
}

function change(node: SpendNode) {
  const prev = sum(node, 'prevCost')
  return prev ? (sum(node, 'cost') - prev) / prev : 0
}

function leafCount(node: SpendNode): number {
  return node.children
    ? node.children.reduce((n, child) => n + leafCount(child), 0)
    : 1
}

const statusDot: Record<NonNullable<SpendNode['status']>, string> = {
  Healthy: 'bg-emerald-500',
  Degraded: 'bg-amber-500',
  Down: 'bg-red-500',
}

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const columns: ColumnDef<SpendNode>[] = [
  {
    accessorKey: 'name',
    header: 'Service',
    cell: ({ row }) => {
      const node = row.original
      return (
        <div
          className="flex min-w-0 items-center gap-1.5"
          style={{ paddingLeft: `${row.depth * 0.9}rem` }}
        >
          {row.getCanExpand() ? (
            <button
              type="button"
              onClick={row.getToggleExpandedHandler()}
              aria-label={row.getIsExpanded() ? 'Collapse row' : 'Expand row'}
              className="flex size-4 shrink-0 items-center justify-center rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <ChevronRight
                className={cn(
                  'size-3.5 transition-transform',
                  row.getIsExpanded() && 'rotate-90',
                )}
              />
            </button>
          ) : (
            <span className="flex size-4 shrink-0 items-center justify-center">
              {node.status && (
                <span
                  title={node.status}
                  className={cn(
                    'size-1.5 rounded-full',
                    statusDot[node.status],
                  )}
                />
              )}
            </span>
          )}
          {node.children ? (
            <span className="truncate font-medium">
              {node.name}
              <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                {leafCount(node)}
              </span>
            </span>
          ) : (
            <span className="truncate font-mono text-xs">{node.name}</span>
          )}
        </div>
      )
    },
  },
  {
    id: 'cost',
    accessorFn: (node) => sum(node, 'cost'),
    header: 'Monthly',
    enableGlobalFilter: false,
    cell: ({ row, getValue }) => (
      <span
        className={cn(
          'font-mono text-xs tabular-nums',
          !row.getCanExpand() && 'text-muted-foreground',
        )}
      >
        {usd.format(getValue<number>())}
      </span>
    ),
  },
  {
    id: 'change',
    accessorFn: change,
    header: 'MoM',
    enableGlobalFilter: false,
    cell: ({ getValue }) => {
      const pct = Math.round(getValue<number>() * 100)
      return (
        <span
          className={cn(
            'font-mono text-xs tabular-nums',
            pct > 0 && 'text-rose-600 dark:text-rose-400',
            pct < 0 && 'text-emerald-600 dark:text-emerald-400',
            pct === 0 && 'text-muted-foreground',
          )}
        >
          {pct > 0 ? '+' : ''}
          {pct}%
        </span>
      )
    },
  },
]

const total = data.reduce((n, node) => n + sum(node, 'cost'), 0)

export function HeroTable() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [expanded, setExpanded] = useState<ExpandedState>({
    platform: true,
    'platform.compute': true,
  })
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    data,
    columns,
    getRowId: (node, _index, parent) =>
      parent ? `${parent.id}.${node.id}` : node.id,
    getSubRows: (node) => node.children,
    filterFromLeafRows: true,
    state: {
      sorting,
      globalFilter,
      // Matches can sit several levels deep, so open everything while searching
      expanded: globalFilter ? true : expanded,
    },
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  })

  const rows = table.getRowModel().rows

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b px-3 py-2">
        <label className="flex min-w-0 flex-1 items-center gap-2 text-muted-foreground">
          <Search className="size-3.5 shrink-0" />
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search services…"
            aria-label="Search services"
            className="h-7 w-full min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>
        <p className="shrink-0 font-mono text-xs text-muted-foreground">
          {usd.format(total)}/mo
        </p>
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                const sorted = header.column.getIsSorted()
                const Icon =
                  sorted === 'asc'
                    ? ArrowUp
                    : sorted === 'desc'
                      ? ArrowDown
                      : ArrowUpDown
                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      'px-3',
                      header.column.id !== 'name' && 'w-0 text-right',
                    )}
                  >
                    <button
                      type="button"
                      onClick={header.column.getToggleSortingHandler()}
                      className="-mx-1 inline-flex items-center gap-1 rounded-sm px-1 outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      <Icon
                        className={cn(
                          'size-3',
                          !sorted && 'text-muted-foreground/50',
                        )}
                      />
                    </button>
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.length ? (
            rows.map((row) => (
              <TableRow
                key={row.id}
                className={cn(row.depth === 0 && 'bg-muted/30')}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      'px-3 py-2.5',
                      cell.column.id === 'name'
                        ? 'w-full max-w-0'
                        : 'text-right',
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                No services match “{globalFilter}”.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
