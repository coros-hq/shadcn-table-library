'use client'

import { Check, PlusCircle } from 'lucide-react'
import type { Column } from '@tanstack/react-table'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '#/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'
import { cn } from '#/lib/utils.ts'

interface FacetedFilterProps<TData> {
  column: Column<TData> | undefined
  title: string
  options: readonly string[]
  /** Optional marker drawn before each option, e.g. a status dot */
  renderIcon?: (value: string) => React.ReactNode
}

/**
 * Multi-select column filter. Counts come from TanStack's faceting, which
 * applies every *other* active filter, so they always add up to what you'd
 * see after ticking that option.
 */
export function FacetedFilter<TData>({
  column,
  title,
  options,
  renderIcon,
}: FacetedFilterProps<TData>) {
  const counts = column?.getFacetedUniqueValues()
  const selected = new Set(
    (column?.getFilterValue() as string[] | undefined) ?? [],
  )

  function toggle(value: string) {
    const next = new Set(selected)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    column?.setFilterValue(next.size ? [...next] : undefined)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircle className="size-3.5" />
          {title}
          {selected.size > 0 && (
            <>
              <span className="mx-0.5 h-4 w-px bg-border" />
              {selected.size > 2 ? (
                <Badge
                  variant="secondary"
                  className="rounded-sm px-1 font-normal"
                >
                  {selected.size} selected
                </Badge>
              ) : (
                [...selected].map((value) => (
                  <Badge
                    key={value}
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {value}
                  </Badge>
                ))
              )}
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.has(option)
                return (
                  <CommandItem key={option} onSelect={() => toggle(option)}>
                    <span
                      className={cn(
                        'flex size-4 items-center justify-center rounded-[4px] border',
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'opacity-50',
                      )}
                    >
                      {isSelected && <Check className="size-3" />}
                    </span>
                    {renderIcon?.(option)}
                    <span className="truncate">{option}</span>
                    <span className="ml-auto font-mono text-xs text-muted-foreground">
                      {counts?.get(option) ?? 0}
                    </span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selected.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => column?.setFilterValue(undefined)}
                    className="justify-center text-center"
                  >
                    Clear filter
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
