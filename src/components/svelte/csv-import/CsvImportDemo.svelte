<script lang="ts">
  import CircleAlert from '@lucide/svelte/icons/circle-alert'
  import CircleCheck from '@lucide/svelte/icons/circle-check'
  import FileSpreadsheet from '@lucide/svelte/icons/file-spreadsheet'
  import Upload from '@lucide/svelte/icons/upload'
  import { Button } from '$lib/components/ui/button/index.js'
  import { cn } from '$lib/utils.js'
  import { parseCsv } from './csv'
  import type { CsvData } from './csv'
  import ReviewTable from './ReviewTable.svelte'
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

  const plural = (n: number, word: string) =>
    `${n} ${word}${n === 1 ? '' : 's'}`

  // Replaced, never mutated, so raw state is enough
  let file = $state.raw<ImportFile>(sample())
  let skipped = $state.raw<ReadonlySet<string>>(new Set())
  let view = $state<View>('all')
  let error = $state<string | null>(null)
  let imported = $state.raw<CustomerRecord[] | null>(null)
  let input = $state<HTMLInputElement | null>(null)

  const rows = $derived(review(file.csv, file.mapping, skipped))
  const missing = $derived(missingRequired(file.mapping))
  const count = (v: View) => rows.filter((r) => inView(r.status, v)).length
  const ready = $derived(count('ready'))
  const attention = $derived(count('attention'))

  function load(next: ImportFile) {
    file = next
    skipped = new Set()
    view = 'all'
    error = null
    imported = null
  }

  async function upload(event: Event) {
    const target = event.currentTarget as HTMLInputElement
    const chosen = target.files?.[0]
    target.value = ''
    if (!chosen) return
    try {
      const csv = parseCsv(await chosen.text())
      load({ name: chosen.name, csv, mapping: autoMap(csv.headers) })
    } catch (e) {
      error = e instanceof Error ? e.message : 'This file could not be read.'
    }
  }

  function setSkipped(ids: string[], skip: boolean) {
    const next = new Set(skipped)
    for (const id of ids) {
      if (skip) next.add(id)
      else next.delete(id)
    }
    skipped = next
  }

  const meta: ReviewMeta = $derived({
    mapping: file.mapping,
    setField: (column, field) => {
      file = { ...file, mapping: assign(file.mapping, column, field) }
    },
    setCell: (rowId, column, value) => {
      file = {
        ...file,
        csv: {
          ...file.csv,
          rows: file.csv.rows.map((cells, i) =>
            String(i) === rowId
              ? cells.map((c, j) => (j === column ? value : c))
              : cells,
          ),
        },
      }
    },
    setSkipped,
  })
</script>

{#if imported}
  <div class="flex flex-col items-start gap-3 rounded-md border p-6">
    <CircleCheck class="size-6 text-emerald-600" />
    <div>
      <p class="font-medium">Imported {plural(imported.length, 'customer')}</p>
      <p class="text-sm text-muted-foreground">
        Values were cleaned up on the way in: emails lowercased, plans and
        country codes in canonical form, seats as numbers.
      </p>
    </div>
    <pre
      class="max-h-48 w-full overflow-auto rounded-md bg-muted p-3 text-xs">{JSON.stringify(
        imported.slice(0, 2),
        null,
        2,
      )}</pre>
    <Button variant="outline" size="sm" onclick={() => load(sample())}>
      Start over
    </Button>
  </div>
{:else}
  <div class="space-y-3">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <p class="flex min-w-0 items-center gap-2 text-sm">
        <FileSpreadsheet class="size-4 shrink-0 text-muted-foreground" />
        <span class="truncate font-medium">{file.name}</span>
        <span class="shrink-0 text-muted-foreground">
          {plural(rows.length, 'row')}
        </span>
      </p>
      <div class="flex gap-2">
        <Button variant="ghost" size="sm" onclick={() => load(sample())}>
          Use sample file
        </Button>
        <Button variant="outline" size="sm" onclick={() => input?.click()}>
          <Upload /> Upload CSV
        </Button>
        <input
          bind:this={input}
          type="file"
          accept=".csv,text/csv"
          class="sr-only"
          tabindex="-1"
          aria-hidden="true"
          onchange={upload}
        />
      </div>
    </div>

    {#if error}
      <p role="alert" class="text-sm text-destructive">{error}</p>
    {/if}

    {#if missing.length}
      <p
        role="status"
        class="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
      >
        <CircleAlert class="size-4 shrink-0" />
        Choose a column for {missing.map((f) => f.label).join(' and ')} in the
        table header before importing.
      </p>
    {/if}

    <div class="flex flex-wrap items-center justify-between gap-2">
      <div
        role="group"
        aria-label="Show rows"
        class="inline-flex rounded-md border p-0.5"
      >
        {#each views as v (v.id)}
          <button
            type="button"
            aria-pressed={view === v.id}
            onclick={() => (view = v.id)}
            class="flex h-7 items-center gap-1.5 rounded px-2.5 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:bg-muted aria-pressed:text-foreground"
          >
            {v.label}
            <span
              class={cn(
                'text-xs tabular-nums',
                v.id === 'attention' && attention > 0 && 'text-destructive',
              )}
            >
              {count(v.id)}
            </span>
          </button>
        {/each}
      </div>
      {#if attention > 0}
        <Button
          variant="ghost"
          size="sm"
          onclick={() =>
            setSkipped(
              rows.filter((r) => inView(r.status, 'attention')).map((r) => r.id),
              true,
            )}
        >
          Skip {plural(attention, 'row')} with problems
        </Button>
      {/if}
    </div>

    <ReviewTable headers={file.csv.headers} {rows} {view} {meta} />

    <div class="flex flex-wrap items-center justify-between gap-3">
      <p aria-live="polite" class="text-sm text-muted-foreground">
        {ready} of {plural(rows.length, 'row')} ready.{attention > 0
          ? ` ${plural(attention, 'row')} with problems won't be imported until fixed or skipped.`
          : ''}
      </p>
      <Button
        size="sm"
        disabled={missing.length > 0 || ready === 0}
        onclick={() => (imported = toRecords(rows, file.mapping))}
      >
        Import {plural(ready, 'customer')}
      </Button>
    </div>
  </div>
{/if}
