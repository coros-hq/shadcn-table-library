import type { Column, RowData } from '@tanstack/react-table-v9'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import type { V9Features } from '#/lib/table-v9-features.ts'

type Props<TData extends RowData> = {
  column?: Column<V9Features, TData, unknown>
  title: string
  options: { value: string; label: string }[]
}

export function DataTableFilter<TData extends RowData>({
  column,
  title,
  options,
}: Props<TData>) {
  const filterValue = column?.getFilterValue() as string | undefined

  return (
    <Select
      onValueChange={(val) => {
        column?.setFilterValue(val)
      }}
      value={filterValue}
    >
      <SelectTrigger className="w-45">
        <SelectValue placeholder={title} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
