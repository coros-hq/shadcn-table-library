<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { CircleAlert, CircleCheck } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { days, draft, people, shiftById, shifts, weekLabel } from './data'
import type { Assignment, Schedule } from './data'
import ScheduleTable from './ScheduleTable.vue'
import ShiftChip from './ShiftChip.vue'
import { assign, changes, conflicts, gaps, load } from './schedule'

// Replaced, never mutated, so shallow refs are enough
const published = shallowRef<Schedule>(draft)
const schedule = shallowRef<Schedule>(draft)

const changed = computed(() => changes(published.value, schedule.value))

const first = (id: string) =>
  people.find((p) => p.id === id)!.name.split(' ')[0]

const issues = computed(() => [
  ...gaps(schedule.value).map(
    (g) =>
      `${days[g.day].short} ${shiftById[g.shift].label.toLowerCase()}: ${g.have} of ${g.need} staffed`,
  ),
  ...conflicts(schedule.value).map(
    (c) =>
      `${first(c.personId)} has ${c.rest}h rest before ${days[c.day].short}`,
  ),
  ...people
    .map((p) => ({ p, ...load(p, schedule.value[p.id]) }))
    .filter((l) => l.status === 'over')
    .map((l) => `${first(l.p.id)} is ${l.diff}h over contract`),
])

function setShift(personId: string, day: number, value: Assignment) {
  schedule.value = assign(schedule.value, personId, day, value)
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <div class="space-y-0.5">
        <p class="text-sm font-medium">Ward 4B · {{ weekLabel }}</p>
        <p class="text-xs text-muted-foreground">
          Click a cell to pick a shift, or move with the arrow keys and type its
          letter.
        </p>
      </div>
      <ul
        aria-label="Shifts"
        class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground"
      >
        <li v-for="s in shifts" :key="s.id" class="flex items-center gap-1.5">
          <ShiftChip :shift="s.id" />
          <span>
            <span class="text-foreground">{{ s.label }}</span>
            {{ s.id === 'leave' ? '' : s.time }}
          </span>
        </li>
      </ul>
    </div>

    <ScheduleTable :schedule="schedule" :changed="changed" :assign="setShift" />

    <div class="flex flex-wrap items-start justify-between gap-3">
      <div aria-live="polite" class="min-w-0 text-sm">
        <details v-if="issues.length">
          <summary
            class="flex cursor-pointer items-center gap-1.5 rounded-sm font-medium text-destructive outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <CircleAlert class="size-4" />
            {{ issues.length }}
            {{ issues.length === 1 ? 'problem' : 'problems' }} to fix
          </summary>
          <ul class="mt-1.5 ml-5.5 list-disc space-y-0.5 text-muted-foreground">
            <li v-for="issue in issues" :key="issue">{{ issue }}</li>
          </ul>
        </details>
        <p v-else class="flex items-center gap-1.5 text-muted-foreground">
          <CircleCheck class="size-4 text-emerald-600" />
          Every shift covered, everyone rested
        </p>
      </div>
      <div class="flex items-center gap-2">
        <span
          :class="
            cn(
              'text-sm whitespace-nowrap tabular-nums',
              changed.size ? 'text-foreground' : 'text-muted-foreground',
            )
          "
        >
          {{
            changed.size
              ? `${changed.size} unpublished change${changed.size === 1 ? '' : 's'}`
              : 'Published'
          }}
        </span>
        <Button
          variant="outline"
          size="sm"
          :disabled="!changed.size"
          @click="schedule = published"
        >
          Discard
        </Button>
        <Button
          size="sm"
          :disabled="!changed.size"
          @click="published = schedule"
        >
          Publish
        </Button>
      </div>
    </div>
  </div>
</template>
