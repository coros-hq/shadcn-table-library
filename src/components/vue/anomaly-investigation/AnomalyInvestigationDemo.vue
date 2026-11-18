<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import { CheckCheck } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import AnomalyTable from './AnomalyTable.vue'
import { inView, kindOf, views } from './anomalies'
import type { View } from './anomalies'
import { metrics as businessMetrics } from './data'
import type { Metric } from './data'
import type { AnomalyMeta } from './styles'

/**
 * The investigation view for any set of metrics. On its own it shows the
 * business example; the finance example passes its own numbers in.
 */
const props = withDefaults(defineProps<{ metrics?: Metric[] }>(), {
  metrics: () => businessMetrics,
})

const view = ref<View>('anomalies')
const hideReviewed = ref(false)
// Replaced, never mutated, so a shallow ref is enough
const reviewed = shallowRef(new Set<string>())

const shown = computed(() =>
  props.metrics.filter(
    (m) =>
      inView(m, view.value) &&
      !(hideReviewed.value && reviewed.value.has(m.id)),
  ),
)
const flagged = computed(() =>
  props.metrics.filter((m) => kindOf(m.today) !== 'normal'),
)
const open = computed(() =>
  flagged.value.filter((m) => !reviewed.value.has(m.id)),
)
const shownOpen = computed(() =>
  shown.value.filter(
    (m) => kindOf(m.today) !== 'normal' && !reviewed.value.has(m.id),
  ),
)

const meta = computed<AnomalyMeta>(() => ({
  reviewed: reviewed.value,
  toggleReviewed: (id) => {
    const next = new Set(reviewed.value)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    reviewed.value = next
  },
}))

function markShown() {
  reviewed.value = new Set([
    ...reviewed.value,
    ...shownOpen.value.map((m) => m.id),
  ])
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
      <div
        role="group"
        aria-label="Show"
        class="inline-flex max-w-full overflow-x-auto rounded-md border p-0.5"
      >
        <button
          v-for="v in views"
          :key="v.id"
          type="button"
          :aria-pressed="view === v.id"
          class="flex h-7 items-center gap-1.5 rounded px-2.5 text-sm whitespace-nowrap text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:bg-muted aria-pressed:text-foreground"
          @click="view = v.id"
        >
          {{ v.label }}
          <span class="text-xs tabular-nums">
            {{ metrics.filter((m) => inView(m, v.id)).length }}
          </span>
        </button>
      </div>
      <div class="flex items-center gap-2">
        <Switch id="hide-reviewed" v-model="hideReviewed" />
        <Label for="hide-reviewed" class="font-normal">Hide reviewed</Label>
      </div>
    </div>

    <AnomalyTable :metrics="shown" :meta="meta" />

    <div
      class="flex flex-wrap items-center justify-between gap-2 rounded-md bg-muted/50 px-3 py-1.5"
    >
      <p aria-live="polite" class="text-sm text-muted-foreground">
        {{
          open.length
            ? `${open.length} of ${flagged.length} anomalies left to review today.`
            : `All ${flagged.length} anomalies reviewed.`
        }}
      </p>
      <Button
        variant="ghost"
        size="sm"
        :disabled="!shownOpen.length"
        @click="markShown"
      >
        <CheckCheck />
        {{
          shownOpen.length
            ? `Mark ${shownOpen.length} shown reviewed`
            : 'All shown reviewed'
        }}
      </Button>
    </div>
  </div>
</template>
