<script setup lang="ts">
import { computed } from 'vue'
import { context, formatDay, formatValue, kindOf } from './anomalies'
import type { Metric } from './data'
import HistoryChart from './HistoryChart.vue'

/** The expanded row: the chart, and the facts that put today in context */
const props = defineProps<{ metric: Metric }>()
const facts = computed(() => context(props.metric))
</script>

<template>
  <div class="grid gap-6 sm:grid-cols-[minmax(0,1fr)_14rem]">
    <HistoryChart :metric="metric" />
    <dl class="grid content-start gap-x-4 gap-y-2 text-sm">
      <div>
        <dt class="text-xs text-muted-foreground">Expected today</dt>
        <dd class="tabular-nums">
          {{ formatValue(metric.today.low, metric) }}–{{
            formatValue(metric.today.high, metric)
          }}
        </dd>
      </div>
      <div>
        <dt class="text-xs text-muted-foreground">7-day average</dt>
        <dd class="tabular-nums">
          {{ formatValue(facts.average7, metric) }}
        </dd>
      </div>
      <div>
        <dt class="text-xs text-muted-foreground">Same day last week</dt>
        <dd class="tabular-nums">
          {{ formatValue(facts.lastWeek.actual, metric) }}
        </dd>
      </div>
      <div>
        <dt class="text-xs text-muted-foreground">
          Earlier days outside the range
        </dt>
        <dd>
          {{
            facts.outside.length
              ? facts.outside
                  .map((p) => `${formatDay(p.date)} (${kindOf(p)})`)
                  .join(', ')
              : 'None in the last 14 days'
          }}
        </dd>
      </div>
    </dl>
  </div>
</template>
