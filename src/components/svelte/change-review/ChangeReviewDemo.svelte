<script lang="ts">
  import CircleCheck from '@lucide/svelte/icons/circle-check'
  import FileDiff from '@lucide/svelte/icons/file-diff'
  import { Button } from '$lib/components/ui/button/index.js'
  import { cn } from '$lib/utils.js'
  import { changes, rows, unchanged } from './data'
  import ChangeReviewTable from './ChangeReviewTable.svelte'
  import DiffPanel from './DiffPanel.svelte'
  import { rowInView } from './columns'
  import {
    WHOLE,
    apply,
    changeKey,
    decide,
    keysOf,
    rowState,
    tally,
  } from './diff'
  import type { Decision, Decisions, View } from './diff'

  const views: { id: View; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'review', label: 'To review' },
    { id: 'accepted', label: 'Accepted' },
    { id: 'rejected', label: 'Rejected' },
  ]

  const plural = (n: number, word: string) =>
    `${n} ${word}${n === 1 ? '' : 's'}`

  // The order the panel steps through: products with changes, as the table lists them
  const reviewOrder = rows.filter((r) => r.change).map((r) => r.id)
  const changeById = new Map(changes.map((c) => [c.id, c]))

  const needsReview = (id: string, d: Decisions) => {
    const state = rowState(changeById.get(id)!, d)
    return state === 'pending' || state === 'partial'
  }

  /** The next product still to review after `from`, wrapping around */
  function nextToReview(from: string | null, d: Decisions) {
    const start = from ? reviewOrder.indexOf(from) : -1
    for (let i = 1; i <= reviewOrder.length; i++) {
      const id = reviewOrder[(start + i) % reviewOrder.length]
      if (needsReview(id, d)) return id
    }
    return null
  }

  // Replaced, never mutated, so raw state is enough
  let decisions = $state.raw<Decisions>({})
  let view = $state<View>('all')
  let openId = $state<string | null>(null)
  let applied = $state.raw<Decisions | null>(null)

  const counts = $derived(tally(changes, decisions))
  const rowCount = (v: View) =>
    v === 'all'
      ? rows.length
      : rows.filter((r) => r.change && rowInView(r, decisions, v)).length
  const toReview = $derived(rowCount('review'))
  const pendingKeys = $derived(
    changes.flatMap(keysOf).filter((k) => !(k in decisions)),
  )
  const openChange = $derived(
    openId ? (changeById.get(openId) ?? null) : null,
  )

  function decideKeys(
    keys: string[],
    decision: Decision | null,
    advance = false,
  ) {
    const next = decide(decisions, keys, decision)
    decisions = next
    // After a decision in the panel, go straight to the next product to review
    if (advance) openId = nextToReview(openId, next)
  }

  function step(by: 1 | -1) {
    const i = openId ? reviewOrder.indexOf(openId) : -1
    openId = reviewOrder[(i + by + reviewOrder.length) % reviewOrder.length]
  }

  const meta = $derived({
    decisions,
    open: (id: string) => (openId = id),
  })

  /** What applying did, record by record */
  const summary = $derived.by(() => {
    const d = applied ?? {}
    const accepted = (k: string) => d[k] === 'accepted'
    return {
      changes: tally(changes, d).accepted,
      updated: changes.filter(
        (c) => c.kind === 'update' && keysOf(c).some(accepted),
      ).length,
      added: changes.filter(
        (c) => c.kind === 'create' && accepted(changeKey(c.id, WHOLE)),
      ).length,
      removed: changes.filter(
        (c) => c.kind === 'delete' && accepted(changeKey(c.id, WHOLE)),
      ).length,
      catalog: unchanged.length + apply(changes, d).length,
    }
  })

  function startOver() {
    applied = null
    decisions = {}
    view = 'all'
  }
</script>

{#if applied}
  <div class="flex flex-col items-start gap-3 rounded-md border p-6">
    <CircleCheck class="size-6 text-emerald-600" />
    <div>
      <p class="font-medium">Applied {plural(summary.changes, 'change')}</p>
      <p class="text-sm text-muted-foreground">
        {plural(summary.updated, 'product')} updated, {summary.added} added, {summary.removed}
        removed. The catalog now has {plural(summary.catalog, 'product')}.
        Rejected and pending changes were left out.
      </p>
    </div>
    <Button variant="outline" size="sm" onclick={startOver}>Start over</Button>
  </div>
{:else}
  <div class="space-y-3">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <p class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        <FileDiff class="size-4 text-muted-foreground" />
        <span class="font-medium">Supplier price list + stocktake</span>
        <span class="text-muted-foreground">
          touches {plural(changes.length, 'product')} of {rows.length}
        </span>
      </p>
      <Button
        size="sm"
        disabled={toReview === 0}
        onclick={() => (openId = nextToReview(null, decisions))}
      >
        {toReview ? `Review ${plural(toReview, 'product')}` : 'All reviewed'}
      </Button>
    </div>

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
            <span class="text-xs tabular-nums">{rowCount(v.id)}</span>
          </button>
        {/each}
      </div>
      <div class="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          disabled={!pendingKeys.length}
          onclick={() => decideKeys(pendingKeys, 'rejected')}
        >
          Reject the rest
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={!pendingKeys.length}
          onclick={() => decideKeys(pendingKeys, 'accepted')}
        >
          Accept the rest
        </Button>
      </div>
    </div>

    <!-- The table scrolls inside this frame, and the panel opens at its right,
         pushing the table aside. The panel is never taller than the frame, so
         its buttons are always in view. -->
    <div class="relative flex overflow-hidden rounded-md border">
      <ChangeReviewTable {rows} {view} {openId} {meta} />
      <DiffPanel
        change={openChange}
        position={{
          index: openId ? reviewOrder.indexOf(openId) : 0,
          total: reviewOrder.length,
        }}
        {decisions}
        ondecide={decideKeys}
        onprevious={() => step(-1)}
        onnext={() => step(1)}
        onclose={() => (openId = null)}
      />
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <p aria-live="polite" class="text-sm text-muted-foreground">
        <span class="text-emerald-700 dark:text-emerald-400">
          {counts.accepted} accepted
        </span>
        ·
        <span class={cn(counts.rejected > 0 && 'text-destructive')}>
          {counts.rejected} rejected
        </span>
        · {counts.pending} to review
      </p>
      <Button
        size="sm"
        variant={counts.pending ? 'outline' : 'default'}
        disabled={counts.accepted === 0}
        onclick={() => (applied = decisions)}
      >
        Apply {plural(counts.accepted, 'change')}
      </Button>
    </div>

  </div>
{/if}
