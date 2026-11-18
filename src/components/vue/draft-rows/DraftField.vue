<script setup lang="ts">
import { computed, ref } from 'vue'
import { parseDate } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'
import { CalendarIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { categories, period, today } from './data'
import { formatDate, parseAmount } from './drafts'
import type { Field } from './drafts'
import type { DraftMeta, DraftRow } from './types'

/** One control of a draft row, with its error message under it */
const props = defineProps<{ row: DraftRow; field: Field; meta: DraftMeta }>()

const labels: Record<Field, string> = {
  date: 'Date',
  description: 'Description',
  category: 'Category',
  amount: 'Amount in dollars',
}

const error = computed(() => props.meta.shownErrors(props.row.id)[props.field])
const errorId = computed(() => `${props.row.id}-${props.field}-error`)
const value = computed(() => props.row.draft[props.field])
const label = computed(
  () => `${labels[props.field]}, new row ${props.row.number}`,
)

const common = computed(() => ({
  'data-draft': props.row.id,
  'data-field': props.field,
  'aria-invalid': !!error.value,
  'aria-describedby': error.value ? errorId.value : undefined,
  disabled: props.meta.saving,
}))

const set = (next: string) => props.meta.update(props.row.id, props.field, next)
const touch = () => props.meta.touch(props.row.id, props.field)

function onBlur() {
  if (props.field === 'amount') {
    // Tidy "12.5" into "12.50" once the user moves on
    const n = parseAmount(value.value)
    if (Number.isFinite(n) && !/\.\d{3,}$/.test(value.value)) set(n.toFixed(2))
  }
  touch()
}

// Enter in a text field goes to the same field one row down
function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter' || event.isComposing) return
  event.preventDefault()
  props.meta.next(props.row.id, props.field)
}

// Closing a picker counts as leaving the field
const dateOpen = ref(false)
function onDateOpen(open: boolean) {
  dateOpen.value = open
  if (!open) touch()
}
function pickDate(date: DateValue | undefined) {
  if (!date) return
  set(date.toString())
  onDateOpen(false)
}
</script>

<template>
  <div class="space-y-1">
    <Popover v-if="field === 'date'" :open="dateOpen" @update:open="onDateOpen">
      <PopoverTrigger as-child>
        <Button
          v-bind="common"
          variant="outline"
          size="sm"
          :aria-label="`${label}: ${value ? formatDate(value) : 'not set'}`"
          :class="
            cn(
              'h-8 w-28 justify-start px-2 font-normal tabular-nums',
              'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
              !value && 'text-muted-foreground',
            )
          "
        >
          <CalendarIcon class="text-muted-foreground" />
          {{ value ? formatDate(value) : 'Pick a date' }}
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-auto p-0" align="start">
        <!-- The report covers November up to today, nothing else -->
        <Calendar
          initial-focus
          :model-value="value ? parseDate(value) : undefined"
          :default-placeholder="parseDate(value || period.from)"
          :min-value="parseDate(period.from)"
          :max-value="parseDate(today)"
          @update:model-value="pickDate"
        />
      </PopoverContent>
    </Popover>

    <Select
      v-else-if="field === 'category'"
      :model-value="value"
      :disabled="meta.saving"
      @update:model-value="(v) => set(String(v))"
      @update:open="(open) => !open && touch()"
    >
      <SelectTrigger v-bind="common" :aria-label="label" class="h-8 w-32">
        <SelectValue placeholder="Choose…" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="c in categories" :key="c" :value="c">
          {{ c }}
        </SelectItem>
      </SelectContent>
    </Select>

    <Input
      v-else
      v-bind="common"
      :aria-label="label"
      :inputmode="field === 'amount' ? 'decimal' : undefined"
      :placeholder="field === 'amount' ? '0.00' : 'What was it for?'"
      :model-value="value"
      :class="
        cn(
          'h-8 px-2',
          field === 'description' && 'min-w-44',
          field === 'amount' && 'ml-auto w-28 text-right tabular-nums',
        )
      "
      @update:model-value="(v) => set(String(v))"
      @blur="onBlur"
      @keydown="onKeydown"
    />

    <p v-if="error" :id="errorId" class="text-xs text-destructive">
      {{ error }}
    </p>
  </div>
</template>
