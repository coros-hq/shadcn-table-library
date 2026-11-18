<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { LoaderCircle, Plus, TriangleAlert } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { periodLabel, saved as initialSaved } from './data'
import type { Expense } from './data'
import DraftRowsTable from './DraftRowsTable.vue'
import {
  batch,
  duplicates,
  emptyDraft,
  fields,
  isBlank,
  money,
  toExpense,
  validate,
} from './drafts'
import type { Draft, Errors, Field } from './drafts'
import type { DraftMeta, Row } from './types'

// One row ready to save, one missing its amount, one that repeats a saved
// expense, so every state is on screen from the start
const initialDrafts: Draft[] = [
  {
    id: 'draft-1',
    date: '2026-11-12',
    description: 'Taxi to airport',
    category: 'Travel',
    amount: '42.80',
  },
  {
    id: 'draft-2',
    date: '2026-11-12',
    description: 'Team lunch',
    category: 'Meals',
    amount: '',
  },
  {
    id: 'draft-3',
    date: '2026-11-04',
    description: 'Client dinner',
    category: 'Meals',
    amount: '148.50',
  },
]

const SAVE_DELAY = 700

const saved = ref<Expense[]>(initialSaved)
const drafts = ref<Draft[]>(initialDrafts)
// `${id}:${field}` for every field the user has left at least once
const touched = ref(new Set<string>())
// After a failed save, every error shows, touched or not
const attempted = ref(false)
const saving = ref(false)
const fresh = ref(new Set<string>())
const confirmDiscard = ref(false)
const message = ref('')

let nextId = 4
const root = ref<HTMLElement>()

async function focusField(id: string, field: Field) {
  await nextTick()
  root.value
    ?.querySelector<HTMLElement>(`[data-draft="${id}"][data-field="${field}"]`)
    ?.focus()
}

let discardTimer: ReturnType<typeof setTimeout> | undefined
watch(confirmDiscard, (on) => {
  clearTimeout(discardTimer)
  if (on) discardTimer = setTimeout(() => (confirmDiscard.value = false), 3000)
})

const summary = computed(() => batch(drafts.value))
const dupes = computed(() => duplicates(drafts.value, saved.value))

function addRow(field: Field = 'description') {
  const draft = emptyDraft(`draft-${nextId++}`, drafts.value.at(-1))
  drafts.value = [...drafts.value, draft]
  focusField(draft.id, field)
}

function shownErrors(id: string): Errors {
  const draft = drafts.value.find((d) => d.id === id)
  // Blank rows are skipped on save, so they never complain
  if (!draft || isBlank(draft)) return {}
  return Object.fromEntries(
    Object.entries(validate(draft)).filter(
      ([field]) => attempted.value || touched.value.has(`${id}:${field}`),
    ),
  )
}

function save() {
  const { filled, invalid } = summary.value
  if (!filled.length) {
    message.value = 'Nothing to save yet. Fill in a row first.'
    return
  }
  if (invalid.length) {
    attempted.value = true
    const errors = validate(invalid[0])
    focusField(
      invalid[0].id,
      fields.find((f) => errors[f])!,
    )
    message.value = `Fix ${invalid.length} ${invalid.length === 1 ? 'row' : 'rows'} before saving.`
    return
  }
  saving.value = true
  message.value = 'Saving…'
  // Stands in for the request that saves the whole batch at once
  setTimeout(() => {
    const added = filled.map((d) => toExpense(d, `exp-${nextId++}`))
    saved.value = [...saved.value, ...added].sort((a, b) =>
      a.date.localeCompare(b.date),
    )
    drafts.value = []
    touched.value = new Set()
    attempted.value = false
    saving.value = false
    fresh.value = new Set(added.map((e) => e.id))
    setTimeout(() => (fresh.value = new Set()), 1600)
    message.value = `Saved ${added.length} ${added.length === 1 ? 'expense' : 'expenses'}.`
  }, SAVE_DELAY)
}

function discard() {
  // Typed-in rows take two clicks to throw away; blank ones go at once
  if (summary.value.filled.length && !confirmDiscard.value) {
    confirmDiscard.value = true
    return
  }
  drafts.value = []
  touched.value = new Set()
  attempted.value = false
  confirmDiscard.value = false
  message.value = 'Draft rows discarded.'
}

const meta = computed<DraftMeta>(() => ({
  shownErrors,
  duplicates: dupes.value,
  saving: saving.value,
  update: (id, field, value) => {
    drafts.value = drafts.value.map((d) =>
      d.id === id ? { ...d, [field]: value } : d,
    )
    confirmDiscard.value = false
  },
  touch: (id, field) => {
    if (!touched.value.has(`${id}:${field}`))
      touched.value = new Set(touched.value).add(`${id}:${field}`)
  },
  remove: (id) => {
    const i = drafts.value.findIndex((d) => d.id === id)
    const rest = drafts.value.filter((d) => d.id !== id)
    drafts.value = rest
    // Keep focus in the table: on the row that moved up, or the one above
    const neighbour = rest.at(i) ?? rest.at(i - 1)
    if (neighbour) focusField(neighbour.id, 'description')
    else
      nextTick(() =>
        root.value?.querySelector<HTMLElement>('[data-add-row]')?.focus(),
      )
  },
  next: (id, field) => {
    const i = drafts.value.findIndex((d) => d.id === id)
    if (i === drafts.value.length - 1) addRow(field)
    else focusField(drafts.value[i + 1].id, field)
  },
}))

const rows = computed<Row[]>(() => [
  ...saved.value.map((expense) => ({
    kind: 'saved' as const,
    id: expense.id,
    expense,
  })),
  ...drafts.value.map((draft, i) => ({
    kind: 'draft' as const,
    id: draft.id,
    draft,
    number: i + 1,
  })),
])

const savedTotal = computed(() =>
  saved.value.reduce((sum, e) => sum + e.amount, 0),
)
const plural = (n: number, one: string, many: string) => (n === 1 ? one : many)
</script>

<template>
  <div ref="root" class="space-y-3">
    <div class="flex flex-wrap items-baseline justify-between gap-2">
      <p class="text-sm">
        <span class="font-medium">Expense report</span>
        <span class="text-muted-foreground"> {{ periodLabel }}</span>
      </p>
      <p class="text-sm text-muted-foreground tabular-nums">
        {{ saved.length }} saved ·
        <span class="font-medium text-foreground">{{ money(savedTotal) }}</span>
      </p>
    </div>

    <DraftRowsTable :rows="rows" :meta="meta" :fresh="fresh">
      <template #footer>
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Button
            data-add-row
            variant="ghost"
            size="sm"
            :disabled="saving"
            @click="addRow()"
          >
            <Plus /> Add row
          </Button>
          <span class="text-xs text-muted-foreground">
            Enter in a description or amount moves down a row, and adds one at
            the end.
          </span>
        </div>
      </template>
    </DraftRowsTable>

    <div
      :class="
        cn(
          'flex flex-wrap items-center justify-between gap-3 rounded-md border px-3 py-2',
          !drafts.length && 'border-dashed',
        )
      "
    >
      <div class="min-w-0 text-sm">
        <p
          v-if="drafts.length"
          class="flex flex-wrap items-center gap-x-2 gap-y-1"
        >
          <span class="font-medium">
            {{ summary.filled.length }} new
            {{ plural(summary.filled.length, 'row', 'rows') }}
          </span>
          <span class="text-muted-foreground tabular-nums">
            {{ money(summary.total) }}
          </span>
          <span v-if="summary.invalid.length" class="text-destructive">
            · {{ summary.invalid.length }}
            {{ plural(summary.invalid.length, 'needs', 'need') }} fixing
          </span>
          <span
            v-if="dupes.size"
            class="flex items-center gap-1 text-amber-700 dark:text-amber-400"
          >
            <TriangleAlert aria-hidden="true" class="size-3.5" />
            {{ dupes.size }} possible
            {{ plural(dupes.size, 'duplicate', 'duplicates') }}
          </span>
        </p>
        <p v-else class="text-muted-foreground">
          No unsaved rows. Add some to start a batch.
        </p>
        <p
          aria-live="polite"
          class="text-xs text-muted-foreground empty:hidden"
        >
          {{ message }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <Button
          :variant="confirmDiscard ? 'destructive' : 'outline'"
          size="sm"
          :disabled="!drafts.length || saving"
          @click="discard"
        >
          {{
            confirmDiscard
              ? `Discard ${summary.filled.length} ${plural(summary.filled.length, 'row', 'rows')}?`
              : 'Discard'
          }}
        </Button>
        <Button size="sm" :disabled="!drafts.length || saving" @click="save">
          <LoaderCircle v-if="saving" class="motion-safe:animate-spin" />
          {{
            saving
              ? 'Saving…'
              : summary.filled.length
                ? `Save ${summary.filled.length} ${plural(summary.filled.length, 'row', 'rows')}`
                : 'Save'
          }}
        </Button>
      </div>
    </div>
  </div>
</template>
