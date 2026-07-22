import type { Column } from '@tanstack/react-table'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

type Props<TData> = {
  column?: Column<TData, unknown>
  title: string
  options: { value: string; label: string }[]
}

export function DataTableFilter<TData>({
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
