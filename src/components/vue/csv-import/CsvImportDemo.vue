<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import { CircleAlert, CircleCheck, FileSpreadsheet, Upload } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { parseCsv } from './csv'
import type { CsvData } from './csv'
import ReviewTable from './ReviewTable.vue'
import type { ReviewMeta } from './columns'
import {
  assign,
  autoMap,
  inView,
  missingRequired,
  review,
  toRecords,
} from './review'
import type { CustomerRecord, Mapping, View } from './review'
import { sampleCsv } from './sample'

interface ImportFile {
  name: string
  csv: CsvData
  mapping: Mapping
}

const sample = (): ImportFile => {
  const csv = parseCsv(sampleCsv)
  return { name: 'customers-export.csv', csv, mapping: autoMap(csv.headers) }
}

const views: { id: View; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'attention', label: 'Needs fixing' },
  { id: 'ready', label: 'Ready' },
  { id: 'skipped', label: 'Skipped' },
]

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

// Replaced, never mutated, so shallow refs are enough
const file = shallowRef<ImportFile>(sample())
const skipped = shallowRef<ReadonlySet<string>>(new Set())
const view = ref<View>('all')
const error = ref<string | null>(null)
const imported = shallowRef<CustomerRecord[] | null>(null)
const input = ref<HTMLInputElement | null>(null)

const rows = computed(() =>
  review(file.value.csv, file.value.mapping, skipped.value),
)
const missing = computed(() => missingRequired(file.value.mapping))
const count = (v: View) => rows.value.filter((r) => inView(r.status, v)).length
const ready = computed(() => count('ready'))
const attention = computed(() => count('attention'))

function load(next: ImportFile) {
  file.value = next
  skipped.value = new Set()
  view.value = 'all'
  error.value = null
  imported.value = null
}

async function upload(event: Event) {
  const target = event.target as HTMLInputElement
  const chosen = target.files?.[0]
  target.value = ''
  if (!chosen) return
  try {
    const csv = parseCsv(await chosen.text())
    load({ name: chosen.name, csv, mapping: autoMap(csv.headers) })
  } catch (e) {
    error.value =
      e instanceof Error ? e.message : 'This file could not be read.'
  }
}

function setSkipped(ids: string[], skip: boolean) {
  const next = new Set(skipped.value)
  for (const id of ids) {
    if (skip) next.add(id)
    else next.delete(id)
  }
  skipped.value = next
}

const meta = computed<ReviewMeta>(() => ({
  mapping: file.value.mapping,
  setField: (column, field) => {
    file.value = {
      ...file.value,
      mapping: assign(file.value.mapping, column, field),
    }
  },
  setCell: (rowId, column, value) => {
    const f = file.value
    file.value = {
      ...f,
      csv: {
        ...f.csv,
        rows: f.csv.rows.map((cells, i) =>
          String(i) === rowId
            ? cells.map((c, j) => (j === column ? value : c))
            : cells,
        ),
      },
    }
  },
  setSkipped,
}))

const skipProblems = () =>
  setSkipped(
    rows.value.filter((r) => inView(r.status, 'attention')).map((r) => r.id),
    true,
  )
</script>

<template>
  <div
    v-if="imported"
    class="flex flex-col items-start gap-3 rounded-md border p-6"
  >
    <CircleCheck class="size-6 text-emerald-600" />
    <div>
      <p class="font-medium">
        Imported {{ plural(imported.length, 'customer') }}
      </p>
      <p class="text-sm text-muted-foreground">
        Values were cleaned up on the way in: emails lowercased, plans and
        country codes in canonical form, seats as numbers.
      </p>
    </div>
    <pre
      class="max-h-48 w-full overflow-auto rounded-md bg-muted p-3 text-xs"
      >{{ JSON.stringify(imported.slice(0, 2), null, 2) }}</pre>
    <Button variant="outline" size="sm" @click="load(sample())">
      Start over
    </Button>
  </div>

  <div v-else class="space-y-3">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <p class="flex min-w-0 items-center gap-2 text-sm">
        <FileSpreadsheet class="size-4 shrink-0 text-muted-foreground" />
        <span class="truncate font-medium">{{ file.name }}</span>
        <span class="shrink-0 text-muted-foreground">
          {{ plural(rows.length, 'row') }}
        </span>
      </p>
      <div class="flex gap-2">
        <Button variant="ghost" size="sm" @click="load(sample())">
          Use sample file
        </Button>
        <Button variant="outline" size="sm" @click="input?.click()">
          <Upload /> Upload CSV
        </Button>
        <input
          ref="input"
          type="file"
          accept=".csv,text/csv"
          class="sr-only"
          tabindex="-1"
          aria-hidden="true"
          @change="upload"
        />
      </div>
    </div>

    <p v-if="error" role="alert" class="text-sm text-destructive">
      {{ error }}
    </p>

    <p
      v-if="missing.length"
      role="status"
      class="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
    >
      <CircleAlert class="size-4 shrink-0" />
      Choose a column for {{ missing.map((f) => f.label).join(' and ') }} in the
      table header before importing.
    </p>

    <div class="flex flex-wrap items-center justify-between gap-2">
      <div
        role="group"
        aria-label="Show rows"
        class="inline-flex rounded-md border p-0.5"
      >
        <button
          v-for="v in views"
          :key="v.id"
          type="button"
          :aria-pressed="view === v.id"
          class="flex h-7 items-center gap-1.5 rounded px-2.5 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:bg-muted aria-pressed:text-foreground"
          @click="view = v.id"
        >
          {{ v.label }}
          <span
            :class="
              cn(
                'text-xs tabular-nums',
                v.id === 'attention' && attention > 0 && 'text-destructive',
              )
            "
          >
            {{ count(v.id) }}
          </span>
        </button>
      </div>
      <Button
        v-if="attention > 0"
        variant="ghost"
        size="sm"
        @click="skipProblems"
      >
        Skip {{ plural(attention, 'row') }} with problems
      </Button>
    </div>

    <ReviewTable
      :headers="file.csv.headers"
      :rows="rows"
      :view="view"
      :meta="meta"
    />

    <div class="flex flex-wrap items-center justify-between gap-3">
      <p aria-live="polite" class="text-sm text-muted-foreground">
        {{ ready }} of {{ plural(rows.length, 'row') }} ready.{{
          attention > 0
            ? ` ${plural(attention, 'row')} with problems won't be imported until fixed or skipped.`
            : ''
        }}
      </p>
      <Button
        size="sm"
        :disabled="missing.length > 0 || ready === 0"
        @click="imported = toRecords(rows, file.mapping)"
      >
        Import {{ plural(ready, 'customer') }}
      </Button>
    </div>
  </div>
</template>
