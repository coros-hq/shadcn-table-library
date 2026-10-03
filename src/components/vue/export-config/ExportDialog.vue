<script setup lang="ts">
import { computed } from 'vue'
import { Download } from '@lucide/vue'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { regions, statuses } from './columns'
import { datePresets } from './export-config'
import type { DatePreset, ExportConfig, ExportFormat } from './export-config'
import CheckboxGroup from './CheckboxGroup.vue'

const props = defineProps<{
  columns: { id: string; label: string }[]
  matchCount: number
  total: number
}>()

const emit = defineEmits<{ reset: []; export: [] }>()

const open = defineModel<boolean>('open', { required: true })
const config = defineModel<ExportConfig>('config', { required: true })

function set<TKey extends keyof ExportConfig>(key: TKey, value: ExportConfig[TKey]) {
  config.value = { ...config.value, [key]: value }
}

const labels = computed(() =>
  Object.fromEntries(props.columns.map((c) => [c.id, c.label])),
)
const canExport = computed(
  () => props.matchCount > 0 && config.value.columns.length > 0,
)

// Keep the table's column order, whatever order they were ticked in
function setColumns(next: string[]) {
  set(
    'columns',
    props.columns.map((c) => c.id).filter((id) => next.includes(id)),
  )
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Export orders</DialogTitle>
        <DialogDescription>
          Choose which orders and columns to include. The table itself stays
          unfiltered.
        </DialogDescription>
      </DialogHeader>

      <div class="max-h-[60svh] space-y-5 overflow-y-auto py-1">
        <CheckboxGroup
          label="Status"
          :options="statuses"
          :selected="config.statuses"
          @update:selected="(next) => set('statuses', next)"
        />
        <CheckboxGroup
          label="Region"
          :options="regions"
          :selected="config.regions"
          @update:selected="(next) => set('regions', next)"
        />

        <div class="space-y-2">
          <p class="text-sm font-medium">Date</p>
          <Select
            :model-value="config.datePreset"
            @update:model-value="(value) => set('datePreset', value as DatePreset)"
          >
            <SelectTrigger class="w-44" aria-label="Date range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="(preset, value) in datePresets"
                :key="value"
                :value="value"
              >
                {{ preset.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <CheckboxGroup
          label="Columns"
          :options="columns.map((c) => c.id)"
          :selected="config.columns"
          :get-label="(id: string) => labels[id] ?? id"
          @update:selected="setColumns"
        />

        <fieldset class="space-y-2">
          <legend class="text-sm font-medium">Format</legend>
          <div class="inline-flex rounded-md border p-0.5">
            <button
              v-for="format in (['csv', 'excel'] as ExportFormat[])"
              :key="format"
              type="button"
              :aria-pressed="config.format === format"
              :class="
                cn(
                  'rounded-sm px-3 py-1 text-sm transition-colors',
                  config.format === format
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )
              "
              @click="set('format', format)"
            >
              {{ format === 'csv' ? 'CSV' : 'Excel' }}
            </button>
          </div>
        </fieldset>
      </div>

      <DialogFooter class="items-center gap-2 sm:justify-between">
        <p class="text-sm text-muted-foreground" aria-live="polite">
          <span class="font-medium text-foreground tabular-nums">
            {{ matchCount }} of {{ total }}
          </span>
          rows will be exported
        </p>
        <div class="flex gap-2">
          <Button type="button" variant="ghost" @click="emit('reset')">
            Reset
          </Button>
          <Button type="button" variant="outline" @click="open = false">
            Cancel
          </Button>
          <Button type="button" :disabled="!canExport" @click="emit('export')">
            <Download class="size-3.5" />
            Export
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
