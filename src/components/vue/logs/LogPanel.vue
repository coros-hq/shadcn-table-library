<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'
import { ChevronDown, ChevronUp, X } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { statusTone } from './columns'
import { formatDay, formatTime } from './data'
import type { LogEntry } from './data'
import LevelLabel from './LevelLabel.vue'
import LogFields from './LogFields.vue'

defineProps<{
  row: Row<LogEntry>
  canPrevious: boolean
  canNext: boolean
}>()
const emit = defineEmits<{ previous: []; next: []; close: [] }>()
</script>

<template>
  <!-- Covers the table on phones, sits beside it from sm up -->
  <aside
    aria-label="Log details"
    class="absolute inset-0 z-10 bg-background sm:static sm:w-80 sm:shrink-0 sm:border-l"
    @keydown.esc="emit('close')"
  >
    <div class="sticky top-0">
      <div class="flex items-center gap-2 border-b py-1.5 pr-1.5 pl-4">
        <LevelLabel :level="row.original.level" />
        <span class="text-sm text-muted-foreground tabular-nums">
          {{ formatDay(row.original.timestamp) }}
          {{ formatTime(row.original.timestamp) }}
        </span>
        <div class="ml-auto flex items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            class="size-7"
            aria-label="Previous event"
            :disabled="!canPrevious"
            @click="emit('previous')"
          >
            <ChevronUp class="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            class="size-7"
            aria-label="Next event"
            :disabled="!canNext"
            @click="emit('next')"
          >
            <ChevronDown class="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            class="size-7"
            aria-label="Close details"
            @click="emit('close')"
          >
            <X class="size-4" />
          </Button>
        </div>
      </div>

      <div class="space-y-4 p-4">
        <div class="space-y-1.5">
          <p class="text-base leading-snug font-medium">{{ row.original.message }}</p>
          <p class="flex flex-wrap items-center gap-x-2 text-sm">
            <span
              :class="cn('font-medium tabular-nums', statusTone(row.original.status))"
            >
              {{ row.original.status }}
            </span>
            <span class="text-xs font-medium text-muted-foreground">
              {{ row.original.method }}
            </span>
            <span class="break-all">{{ row.original.path }}</span>
            <span class="text-muted-foreground">· {{ row.original.service }}</span>
          </p>
        </div>
        <LogFields
          :log="row.original"
          :omit="['Level', 'Message', 'Method', 'Path', 'Status', 'Service']"
          class="border-t pt-4"
        />
      </div>
    </div>
  </aside>
</template>
