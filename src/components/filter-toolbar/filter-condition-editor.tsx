'use client'

import { useState } from 'react'

import type { Table } from '@tanstack/react-table'

import { Button } from '#/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '#/components/ui/command'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { FilterValueInput } from './filter-value-input'
import { isValueValid, operatorRegistry } from './operators'
import './types'

export interface FilterConditionEditorProps<TData> {
  table: Table<TData>
  /** Locked column — present when editing an existing condition. */
  columnId?: string
  /** Columns selectable in the "pick a column" step (add mode only). */
  availableColumnIds?: string[]
  initialOperator?: string
  initialValue?: unknown
  onApply: (columnId: string, operator: string, value: unknown) => void
  /** Present only in edit mode. */
  onRemove?: () => void
}

export function FilterConditionEditor<TData>({
  table,
  columnId: lockedColumnId,
  availableColumnIds = [],
  initialOperator,
  initialValue,
  onApply,
  onRemove,
}: FilterConditionEditorProps<TData>) {
  const [columnId, setColumnId] = useState<string | undefined>(lockedColumnId)
  const [operator, setOperator] = useState<string | undefined>(initialOperator)
  const [value, setValue] = useState<unknown>(initialValue)

  const meta = columnId ? table.getColumn(columnId)?.columnDef.meta : undefined
  const operators = meta?.filterVariant ? operatorRegistry[meta.filterVariant] : []
  const activeOperator = operators.find((o) => o.value === operator)

  function selectColumn(id: string) {
    const nextMeta = table.getColumn(id)?.columnDef.meta
    const nextOperators = nextMeta?.filterVariant
      ? operatorRegistry[nextMeta.filterVariant]
      : []
    setColumnId(id)
    setOperator(nextOperators[0]?.value)
    setValue(undefined)
  }

  // Step 1: no column locked and none picked yet — choose which column to filter.
  if (!lockedColumnId && !columnId) {
    return (
      <Command>
        <CommandInput placeholder="Filter by..." />
        <CommandList>
          <CommandEmpty>No more columns to filter.</CommandEmpty>
          <CommandGroup>
            {availableColumnIds.map((id) => (
              <CommandItem key={id} onSelect={() => selectColumn(id)}>
                {table.getColumn(id)?.columnDef.meta?.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    )
  }

  if (!columnId || !meta?.filterVariant) return null

  // Step 2: column is set — choose operator, then the matching value input.
  return (
    <div className="space-y-3 p-3">
      <p className="text-sm font-medium text-foreground">{meta.label}</p>

      <Select value={operator} onValueChange={setOperator}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Operator" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {operators.map((op) => (
              <SelectItem key={op.value} value={op.value}>
                {op.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {activeOperator && (
        <FilterValueInput
          label={meta.label}
          variant={meta.filterVariant}
          operator={activeOperator}
          options={meta.filterOptions}
          value={value}
          onChange={setValue}
        />
      )}

      <div className="flex items-center justify-between pt-1">
        {onRemove ? (
          <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
            Remove
          </Button>
        ) : (
          <span />
        )}
        <Button
          type="button"
          size="sm"
          disabled={!activeOperator || !isValueValid(activeOperator, value)}
          onClick={() => activeOperator && onApply(columnId, activeOperator.value, value)}
        >
          Apply
        </Button>
      </div>
    </div>
  )
}
