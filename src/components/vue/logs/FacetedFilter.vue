<script setup lang="ts" generic="TData">
import { computed } from 'vue'
import { Check, PlusCircle } from '@lucide/vue'
import type { Column } from '@tanstack/vue-table'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

/**
 * Multi-select column filter. Counts come from TanStack's faceting, which
 * applies every *other* active filter, so they always add up to what you'd
 * see after ticking that option.
 */
const props = withDefaults(
  defineProps<{
    column: Column<TData> | undefined
    title: string
    options: readonly string[]
    /** Display text for an option, when it differs from the stored value */
    formatLabel?: (value: string) => string
  }>(),
  { formatLabel: (value: string) => value },
)

defineSlots<{
  /** Optional marker drawn before each option, e.g. a level dot */
  icon?: (props: { value: string }) => unknown
}>()

const counts = computed(() => props.column?.getFacetedUniqueValues())
const selected = computed(
  () => new Set((props.column?.getFilterValue() as string[] | undefined) ?? []),
)

function toggle(value: string) {
  const next = new Set(selected.value)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  props.column?.setFilterValue(next.size ? [...next] : undefined)
}
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button variant="outline" size="sm" class="h-8 border-dashed">
        <PlusCircle class="size-3.5" />
        {{ title }}
        <template v-if="selected.size > 0">
          <span class="mx-0.5 h-4 w-px bg-border" />
          <Badge
            v-if="selected.size > 2"
            variant="secondary"
            class="rounded-sm px-1 font-normal"
          >
            {{ selected.size }} selected
          </Badge>
          <template v-else>
            <Badge
              v-for="value in [...selected]"
              :key="value"
              variant="secondary"
              class="rounded-sm px-1 font-normal"
            >
              {{ formatLabel(value) }}
            </Badge>
          </template>
        </template>
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-56 p-0" align="end">
      <Command>
        <CommandInput :placeholder="title" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup>
            <CommandItem
              v-for="option in options"
              :key="option"
              :value="option"
              @select="toggle(option)"
            >
              <span
                :class="
                  cn(
                    'flex size-4 items-center justify-center rounded-[4px] border',
                    selected.has(option)
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'opacity-50',
                  )
                "
              >
                <Check v-if="selected.has(option)" class="size-3" />
              </span>
              <slot name="icon" :value="option" />
              <span class="truncate">{{ formatLabel(option) }}</span>
              <span class="ml-auto text-xs text-muted-foreground tabular-nums">
                {{ counts?.get(option) ?? 0 }}
              </span>
            </CommandItem>
          </CommandGroup>
          <template v-if="selected.size > 0">
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                value="Clear filter"
                class="justify-center text-center"
                @select="column?.setFilterValue(undefined)"
              >
                Clear filter
              </CommandItem>
            </CommandGroup>
          </template>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>
