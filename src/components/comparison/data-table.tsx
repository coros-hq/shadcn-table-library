'use client'

import { useMemo } from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { Check, X } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils.ts'
import type { Feature, FeatureValue, Plan } from './comparison'

interface ComparisonTableProps {
  plans: Plan[]
  features: Feature[]
}

function renderValue(value: FeatureValue) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="mx-auto h-4 w-4 text-emerald-600 dark:text-emerald-500" />
    ) : (
      <X className="mx-auto h-4 w-4 text-muted-foreground/40" />
    )
  }
  return value
}

export function ComparisonTable({ plans, features }: ComparisonTableProps) {
  const columns = useMemo<ColumnDef<Feature>[]>(
    () => [
      {
        id: 'feature',
        header: '',
        accessorKey: 'label',
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground">
            {getValue() as string}
          </span>
        ),
      },
      ...plans.map(
        (plan): ColumnDef<Feature> => ({
          id: plan.id,
          header: plan.name,
          accessorFn: (feature) => feature.values[plan.id],
          cell: ({ getValue }) => (
            <div className="text-center">
              {renderValue(getValue() as FeatureValue)}
            </div>
          ),
        }),
      ),
    ],
    [plans],
  )

  const table = useReactTable({
    data: features,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead />
            {plans.map((plan) => (
              <TableHead
                key={plan.id}
                className={cn(
                  'py-4 align-bottom text-center',
                  plan.highlighted && 'bg-primary/5',
                )}
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    {plan.name}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {plan.price}
                    <span className="text-sm font-normal text-muted-foreground">
                      {plan.period}
                    </span>
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant={plan.highlighted ? 'default' : 'outline'}
                    className="mt-2 w-full"
                  >
                    {plan.cta}
                  </Button>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => {
                const plan = plans.find((p) => p.id === cell.column.id)
                return (
                  <TableCell
                    key={cell.id}
                    className={cn(plan?.highlighted && 'bg-primary/5')}
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext(),
                    )}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
