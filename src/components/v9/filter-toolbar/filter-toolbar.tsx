'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

import type { Table, RowData} from '@tanstack/react-table-v9'

import { Button } from '#/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'
import { FilterConditionEditor } from './filter-condition-editor'
import { formatConditionValue, operatorRegistry } from './operators'
import type { FilterCondition } from './operators'
import { useFilterConditions } from './use-filter-conditions'
import type { FilterToolbarFeatures } from './types'
import './types'

export interface FilterToolbarProps<TData extends RowData> {
  table: Table<FilterToolbarFeatures, TData>
}

export function FilterToolbar<TData extends RowData>({ table }: FilterToolbarProps<TData>) {
  const conditions = useFilterConditions(table)
  const filterableColumns = table
    .getAllColumns()
    .filter((column) => column.columnDef.meta?.filterVariant)

  if (filterableColumns.length === 0) return null

  const activeColumnIds = new Set(conditions.map((c) => c.columnId))
  const availableColumnIds = filterableColumns
    .filter((column) => !activeColumnIds.has(column.id))
    .map((column) => column.id)

  return (
    <div className="flex flex-wrap items-center gap-2">
      {conditions.map((condition) => (
        <FilterConditionPill
          key={condition.columnId}
          table={table}
          condition={condition}
        />
      ))}

      {availableColumnIds.length > 0 && (
        <AddFilterTrigger table={table} availableColumnIds={availableColumnIds} />
      )}
    </div>
  )
}

function AddFilterTrigger<TData extends RowData>({
  table,
  availableColumnIds,
}: {
  table: Table<FilterToolbarFeatures, TData>
  availableColumnIds: string[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Plus className="h-4 w-4" />
          Add filter
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <FilterConditionEditor
          table={table}
          availableColumnIds={availableColumnIds}
          onApply={(columnId, operator, value) => {
            table.getColumn(columnId)?.setFilterValue({ operator, value })
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

function FilterConditionPill<TData extends RowData>({
  table,
  condition,
}: {
  table: Table<FilterToolbarFeatures, TData>
  condition: FilterCondition
}) {
  const [open, setOpen] = useState(false)
  const meta = table.getColumn(condition.columnId)?.columnDef.meta
  const operators = meta?.filterVariant ? operatorRegistry[meta.filterVariant] : []
  const activeOperator = operators.find((o) => o.value === condition.operator)

  if (!meta?.filterVariant) return null

  const valueDisplay = formatConditionValue(
    meta.filterVariant,
    activeOperator,
    condition.value,
    meta.filterOptions,
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <span>{meta.label}</span>
          <span className="text-muted-foreground">{activeOperator?.label}</span>
          {valueDisplay && <span className="font-medium">{valueDisplay}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <FilterConditionEditor
          table={table}
          columnId={condition.columnId}
          initialOperator={condition.operator}
          initialValue={condition.value}
          onApply={(columnId, operator, value) => {
            table.getColumn(columnId)?.setFilterValue({ operator, value })
            setOpen(false)
          }}
          onRemove={() => {
            table.getColumn(condition.columnId)?.setFilterValue(undefined)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
