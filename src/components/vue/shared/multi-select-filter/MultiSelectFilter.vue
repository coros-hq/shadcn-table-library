<script setup lang="ts">
import { PlusCircle } from '@lucide/vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

defineProps<{
  title: string
  options: { label: string; value: string; count?: number }[]
}>()

const selected = defineModel<string[]>('selected', { required: true })

function toggle(value: string) {
  selected.value = selected.value.includes(value)
    ? selected.value.filter((v) => v !== value)
    : [...selected.value, value]
}
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button variant="outline" size="sm">
        <PlusCircle class="mr-2 h-4 w-4" />
        {{ title }}
        <Badge v-if="selected.length > 0" variant="secondary" class="ml-2">
          {{ selected.length }}
        </Badge>
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-[200px] p-0" align="start">
      <Command>
        <CommandInput :placeholder="title" />
        <CommandList>
          <CommandGroup>
            <!-- The label is the searchable value; the option's own value is what gets toggled -->
            <CommandItem
              v-for="option in options"
              :key="option.value"
              :value="option.label"
              @select="toggle(option.value)"
            >
              <Checkbox
                :model-value="selected.includes(option.value)"
                class="pointer-events-none mr-2"
                tabindex="-1"
              />
              <span>{{ option.label }}</span>
              <span
                v-if="option.count !== undefined"
                class="ml-auto text-xs text-muted-foreground"
              >
                {{ option.count }}
              </span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>
