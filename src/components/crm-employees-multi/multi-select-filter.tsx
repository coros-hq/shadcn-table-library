import { PlusCircle } from 'lucide-react'
import { Button } from '#/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'
import { Badge } from '#/components/ui/badge'
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '#/components/ui/command'
import { Checkbox } from '#/components/ui/checkbox'

export function MultiSelectFilter({
  title,
  options,
  selected,
  onChange,
}: {
  title: string
  options: { label: string; value: string; count?: number }[]
  selected: string[]
  onChange: (values: string[]) => void
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          {title}
          {selected.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {selected.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      onChange(
                        isSelected
                          ? selected.filter((v) => v !== option.value)
                          : [...selected, option.value],
                      )
                    }}
                  >
                    <Checkbox
                      checked={isSelected}
                      className="mr-2 [&_svg]:text-primary-foreground!"
                    />
                    <span>{option.label}</span>
                    {option.count !== undefined && (
                      <span className="ml-auto text-muted-foreground text-xs">
                        {option.count}
                      </span>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
