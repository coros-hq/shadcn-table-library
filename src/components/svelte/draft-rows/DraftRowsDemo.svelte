<script lang="ts">
  import { tick } from 'svelte'
  import LoaderCircle from '@lucide/svelte/icons/loader-circle'
  import Plus from '@lucide/svelte/icons/plus'
  import TriangleAlert from '@lucide/svelte/icons/triangle-alert'
  import { Button } from '$lib/components/ui/button/index.js'
  import { cn } from '$lib/utils.js'
  import { periodLabel, saved as initialSaved } from './data'
  import type { Expense } from './data'
  import DraftRowsTable from './DraftRowsTable.svelte'
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

  // Replaced, never mutated, so raw state is enough
  let saved = $state.raw<Expense[]>(initialSaved)
  let drafts = $state.raw<Draft[]>(initialDrafts)
  // `${id}:${field}` for every field the user has left at least once
  let touched = $state.raw(new Set<string>())
  // After a failed save, every error shows, touched or not
  let attempted = $state(false)
  let saving = $state(false)
  let fresh = $state.raw(new Set<string>())
  let confirmDiscard = $state(false)
  let message = $state('')

  let nextId = 4
  let root = $state<HTMLElement>()

  async function focusField(id: string, field: Field) {
    await tick()
    root
      ?.querySelector<HTMLElement>(`[data-draft="${id}"][data-field="${field}"]`)
      ?.focus()
  }

  $effect(() => {
    if (!confirmDiscard) return
    const timer = setTimeout(() => (confirmDiscard = false), 3000)
    return () => clearTimeout(timer)
  })

  const summary = $derived(batch(drafts))
  const dupes = $derived(duplicates(drafts, saved))

  function addRow(field: Field = 'description') {
    const draft = emptyDraft(`draft-${nextId++}`, drafts.at(-1))
    drafts = [...drafts, draft]
    focusField(draft.id, field)
  }

  function shownErrors(id: string): Errors {
    const draft = drafts.find((d) => d.id === id)
    // Blank rows are skipped on save, so they never complain
    if (!draft || isBlank(draft)) return {}
    return Object.fromEntries(
      Object.entries(validate(draft)).filter(
        ([field]) => attempted || touched.has(`${id}:${field}`),
      ),
    )
  }

  function save() {
    const { filled, invalid } = summary
    if (!filled.length) {
      message = 'Nothing to save yet. Fill in a row first.'
      return
    }
    if (invalid.length) {
      attempted = true
      const errors = validate(invalid[0])
      focusField(invalid[0].id, fields.find((f) => errors[f])!)
      message = `Fix ${invalid.length} ${invalid.length === 1 ? 'row' : 'rows'} before saving.`
      return
    }
    saving = true
    message = 'Saving…'
    // Stands in for the request that saves the whole batch at once
    setTimeout(() => {
      const added = filled.map((d) => toExpense(d, `exp-${nextId++}`))
      saved = [...saved, ...added].sort((a, b) => a.date.localeCompare(b.date))
      drafts = []
      touched = new Set()
      attempted = false
      saving = false
      fresh = new Set(added.map((e) => e.id))
      setTimeout(() => (fresh = new Set()), 1600)
      message = `Saved ${added.length} ${added.length === 1 ? 'expense' : 'expenses'}.`
    }, SAVE_DELAY)
  }

  function discard() {
    // Typed-in rows take two clicks to throw away; blank ones go at once
    if (summary.filled.length && !confirmDiscard) {
      confirmDiscard = true
      return
    }
    drafts = []
    touched = new Set()
    attempted = false
    confirmDiscard = false
    message = 'Draft rows discarded.'
  }

  const meta: DraftMeta = $derived({
    shownErrors,
    duplicates: dupes,
    saving,
    update: (id, field, value) => {
      drafts = drafts.map((d) => (d.id === id ? { ...d, [field]: value } : d))
      confirmDiscard = false
    },
    touch: (id, field) => {
      if (!touched.has(`${id}:${field}`))
        touched = new Set(touched).add(`${id}:${field}`)
    },
    remove: (id) => {
      const i = drafts.findIndex((d) => d.id === id)
      const rest = drafts.filter((d) => d.id !== id)
      drafts = rest
      // Keep focus in the table: on the row that moved up, or the one above
      const neighbour = rest.at(i) ?? rest.at(i - 1)
      if (neighbour) focusField(neighbour.id, 'description')
      else
        tick().then(() =>
          root?.querySelector<HTMLElement>('[data-add-row]')?.focus(),
        )
    },
    next: (id, field) => {
      const i = drafts.findIndex((d) => d.id === id)
      if (i === drafts.length - 1) addRow(field)
      else focusField(drafts[i + 1].id, field)
    },
  })

  const rows: Row[] = $derived([
    ...saved.map((expense) => ({
      kind: 'saved' as const,
      id: expense.id,
      expense,
    })),
    ...drafts.map((draft, i) => ({
      kind: 'draft' as const,
      id: draft.id,
      draft,
      number: i + 1,
    })),
  ])

  const savedTotal = $derived(saved.reduce((sum, e) => sum + e.amount, 0))
  const plural = (n: number, one: string, many: string) =>
    n === 1 ? one : many
</script>

<div bind:this={root} class="space-y-3">
  <div class="flex flex-wrap items-baseline justify-between gap-2">
    <p class="text-sm">
      <span class="font-medium">Expense report</span>
      <span class="text-muted-foreground">{periodLabel}</span>
    </p>
    <p class="text-sm text-muted-foreground tabular-nums">
      {saved.length} saved ·
      <span class="font-medium text-foreground">{money(savedTotal)}</span>
    </p>
  </div>

  <DraftRowsTable {rows} {meta} {fresh}>
    {#snippet footer()}
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Button
          data-add-row
          variant="ghost"
          size="sm"
          disabled={saving}
          onclick={() => addRow()}
        >
          <Plus /> Add row
        </Button>
        <span class="text-xs text-muted-foreground">
          Enter in a description or amount moves down a row, and adds one at the end.
        </span>
      </div>
    {/snippet}
  </DraftRowsTable>

  <div
    class={cn(
      'flex flex-wrap items-center justify-between gap-3 rounded-md border px-3 py-2',
      !drafts.length && 'border-dashed',
    )}
  >
    <div class="min-w-0 text-sm">
      {#if drafts.length}
        <p class="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span class="font-medium">
            {summary.filled.length} new {plural(
              summary.filled.length,
              'row',
              'rows',
            )}
          </span>
          <span class="text-muted-foreground tabular-nums">
            {money(summary.total)}
          </span>
          {#if summary.invalid.length}
            <span class="text-destructive">
              · {summary.invalid.length}
              {plural(summary.invalid.length, 'needs', 'need')} fixing
            </span>
          {/if}
          {#if dupes.size}
            <span
              class="flex items-center gap-1 text-amber-700 dark:text-amber-400"
            >
              <TriangleAlert aria-hidden="true" class="size-3.5" />
              {dupes.size} possible {plural(
                dupes.size,
                'duplicate',
                'duplicates',
              )}
            </span>
          {/if}
        </p>
      {:else}
        <p class="text-muted-foreground">
          No unsaved rows. Add some to start a batch.
        </p>
      {/if}
      <p aria-live="polite" class="text-xs text-muted-foreground empty:hidden">
        {message}
      </p>
    </div>
    <div class="flex items-center gap-2">
      <Button
        variant={confirmDiscard ? 'destructive' : 'outline'}
        size="sm"
        disabled={!drafts.length || saving}
        onclick={discard}
      >
        {confirmDiscard
          ? `Discard ${summary.filled.length} ${plural(summary.filled.length, 'row', 'rows')}?`
          : 'Discard'}
      </Button>
      <Button size="sm" disabled={!drafts.length || saving} onclick={save}>
        {#if saving}
          <LoaderCircle class="motion-safe:animate-spin" />
        {/if}
        {saving
          ? 'Saving…'
          : summary.filled.length
            ? `Save ${summary.filled.length} ${plural(summary.filled.length, 'row', 'rows')}`
            : 'Save'}
      </Button>
    </div>
  </div>
</div>
