'use client'

import type { DateRange } from 'react-day-picker'

import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { MultiSelectFilter } from '#/components/ui/multiple-select-filter'
import { DateRangeFilter } from './date-range-filter'
import type { OperatorDef } from './operators'
import type { FilterOption, FilterVariant } from './types'

export interface FilterValueInputProps {
  label: string
  variant: FilterVariant
  operator: OperatorDef
  options?: FilterOption[]
  value: unknown
  onChange: (value: unknown) => void
}

/**
 * Renders the value control for a condition's valueShape/variant pair.
 * `operator.valueShape` decides whether anything renders at all ("is empty"
 * needs no value); `variant` decides which control fills a given shape,
 * reusing the same DateRangeFilter/MultiSelectFilter used elsewhere.
 */
export function FilterValueInput({
  label,
  variant,
  operator,
  options,
  value,
  onChange,
}: FilterValueInputProps) {
  if (operator.valueShape === 'none') return null

  switch (variant) {
    case 'text':
      return (
        <Input
          autoFocus
          placeholder="Value"
          value={(value as string | undefined) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full"
        />
      )

    case 'number':
      return (
        <Input
          autoFocus
          type="number"
          placeholder="Value"
          value={(value as number | undefined) ?? ''}
          onChange={(e) =>
            onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)
          }
          className="w-full"
        />
      )

    case 'select':
      return (
        <Select
          value={(value as string | undefined) ?? ''}
          onValueChange={onChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select value" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      )

    case 'multiSelect':
      return (
        <MultiSelectFilter
          title={label}
          options={options ?? []}
          selected={(value as string[] | undefined) ?? []}
          onChange={onChange}
        />
      )

    case 'dateRange':
      return (
        <DateRangeFilter
          label={label}
          value={value as DateRange | undefined}
          onChange={onChange}
        />
      )
  }
}
