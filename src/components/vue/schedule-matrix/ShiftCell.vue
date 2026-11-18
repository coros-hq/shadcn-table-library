<script setup lang="ts">
import { computed, ref } from 'vue'
import { Check, TriangleAlert } from '@lucide/vue'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { shiftById } from './data'
import type { Assignment } from './data'
import ShiftChip from './ShiftChip.vue'
import { options, shiftTone } from './tone'

const props = defineProps<{
  /** Lets the table find this cell to move focus to it */
  cellKey: string
  value: Assignment
  /** Who and which day, for screen readers: "Tom Becker, Wed 25" */
  label: string
  changed: boolean
  /** Hours of rest before this shift when it's too few, otherwise null */
  rest: number | null
  /** Roving tabindex: only the grid's current cell is in the tab order */
  tabbable: boolean
  onAssign: (value: Assignment) => void
  onKeydown: (event: KeyboardEvent) => void
}>()

const open = ref(false)
const shift = computed(() => (props.value ? shiftById[props.value] : null))

const description = computed(() =>
  [
    shift.value ? `${shift.value.label}, ${shift.value.time}` : 'Off',
    props.rest !== null
      ? `only ${props.rest}h rest after the previous shift`
      : null,
    props.changed ? 'changed' : null,
  ]
    .filter(Boolean)
    .join('; '),
)

const list = ref<HTMLElement>()

// Start on the current choice rather than the first one
function focusCurrent(event: Event) {
  event.preventDefault()
  list.value?.querySelector<HTMLElement>('[aria-pressed="true"]')?.focus()
}

function moveInList(event: KeyboardEvent) {
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
  event.preventDefault()
  const items = [...(list.value?.querySelectorAll<HTMLElement>('button') ?? [])]
  const i = items.indexOf(document.activeElement as HTMLElement)
  const next = event.key === 'ArrowDown' ? i + 1 : i - 1
  items[(next + items.length) % items.length]?.focus()
}

function pick(value: Assignment) {
  props.onAssign(value)
  open.value = false
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <button
        type="button"
        :data-cell="cellKey"
        :tabindex="tabbable ? 0 : -1"
        :aria-label="`${label}: ${description}`"
        :title="
          rest !== null
            ? `Only ${rest}h rest since the previous shift (11h minimum)`
            : undefined
        "
        :class="
          cn(
            'group/cell relative flex h-11 w-full min-w-14 items-center justify-center rounded-md text-xs font-semibold outline-none',
            'focus-visible:ring-[3px] focus-visible:ring-ring/60',
            shift
              ? shiftTone[shift.id]
              : 'text-muted-foreground/40 hover:bg-muted hover:text-muted-foreground',
            rest !== null && 'ring-2 ring-destructive ring-inset',
          )
        "
        @keydown="onKeydown"
      >
        <template v-if="shift">{{ shift.code }}</template>
        <template v-else>
          <span aria-hidden="true" class="group-hover/cell:hidden">–</span>
          <span aria-hidden="true" class="hidden group-hover/cell:inline">
            +
          </span>
        </template>
        <TriangleAlert
          v-if="rest !== null"
          aria-hidden="true"
          class="absolute top-1 left-1 size-3 text-destructive"
        />
        <span
          v-if="changed"
          aria-hidden="true"
          class="absolute top-1 right-1 size-1.5 rounded-full bg-blue-500"
        />
      </button>
    </PopoverTrigger>
    <PopoverContent
      align="center"
      class="w-56 p-1"
      :aria-label="`Shift for ${label}`"
      @open-auto-focus="focusCurrent"
      @keydown="moveInList"
    >
      <div ref="list">
        <p class="px-2 pt-1 pb-1.5 text-xs text-muted-foreground">
          {{ label }}
        </p>
        <button
          v-for="option in options"
          :key="option.label"
          type="button"
          :aria-pressed="option.value === value"
          class="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none hover:bg-accent focus-visible:bg-accent"
          @click="pick(option.value)"
        >
          <ShiftChip v-if="option.value" :shift="option.value" />
          <span
            v-else
            aria-hidden="true"
            class="inline-flex size-5 items-center justify-center rounded border border-dashed text-[11px] text-muted-foreground"
          >
            –
          </span>
          <span class="flex-1">{{ option.label }}</span>
          <span class="text-xs text-muted-foreground tabular-nums">
            {{ option.time }}
          </span>
          <Check
            aria-hidden="true"
            :class="
              cn('size-4', option.value === value ? 'opacity-100' : 'opacity-0')
            "
          />
        </button>
        <p class="mt-1 border-t px-2 pt-1.5 pb-1 text-xs text-muted-foreground">
          Or type E, L, N, A on a cell. Delete clears it.
        </p>
      </div>
    </PopoverContent>
  </Popover>
</template>
