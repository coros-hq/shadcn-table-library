<script lang="ts">
  import CheckCheck from '@lucide/svelte/icons/check-check'
  import { Button } from '$lib/components/ui/button/index.js'
  import { Label } from '$lib/components/ui/label/index.js'
  import { Switch } from '$lib/components/ui/switch/index.js'
  import AnomalyTable from './AnomalyTable.svelte'
  import { inView, kindOf, views } from './anomalies'
  import type { View } from './anomalies'
  import { metrics as businessMetrics } from './data'
  import type { Metric } from './data'
  import type { AnomalyMeta } from './styles'

  // The investigation view for any set of metrics. On its own it shows the
  // business example; the finance example passes its own numbers in.
  let { metrics = businessMetrics }: { metrics?: Metric[] } = $props()

  let view = $state<View>('anomalies')
  let hideReviewed = $state(false)
  // Replaced, never mutated, so raw state is enough
  let reviewed = $state.raw(new Set<string>())

  const shown = $derived(
    metrics.filter(
      (m) => inView(m, view) && !(hideReviewed && reviewed.has(m.id)),
    ),
  )
  const flagged = $derived(metrics.filter((m) => kindOf(m.today) !== 'normal'))
  const open = $derived(flagged.filter((m) => !reviewed.has(m.id)))
  const shownOpen = $derived(
    shown.filter((m) => kindOf(m.today) !== 'normal' && !reviewed.has(m.id)),
  )

  const meta: AnomalyMeta = $derived({
    reviewed,
    toggleReviewed: (id) => {
      const next = new Set(reviewed)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      reviewed = next
    },
  })
</script>

<div class="space-y-3">
  <div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
    <div
      role="group"
      aria-label="Show"
      class="inline-flex max-w-full overflow-x-auto rounded-md border p-0.5"
    >
      {#each views as v (v.id)}
        <button
          type="button"
          aria-pressed={view === v.id}
          onclick={() => (view = v.id)}
          class="flex h-7 items-center gap-1.5 rounded px-2.5 text-sm whitespace-nowrap text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:bg-muted aria-pressed:text-foreground"
        >
          {v.label}
          <span class="text-xs tabular-nums">
            {metrics.filter((m) => inView(m, v.id)).length}
          </span>
        </button>
      {/each}
    </div>
    <div class="flex items-center gap-2">
      <Switch id="hide-reviewed" bind:checked={hideReviewed} />
      <Label for="hide-reviewed" class="font-normal">Hide reviewed</Label>
    </div>
  </div>

  <AnomalyTable metrics={shown} {meta} />

  <div
    class="flex flex-wrap items-center justify-between gap-2 rounded-md bg-muted/50 px-3 py-1.5"
  >
    <p aria-live="polite" class="text-sm text-muted-foreground">
      {open.length
        ? `${open.length} of ${flagged.length} anomalies left to review today.`
        : `All ${flagged.length} anomalies reviewed.`}
    </p>
    <Button
      variant="ghost"
      size="sm"
      disabled={!shownOpen.length}
      onclick={() =>
        (reviewed = new Set([...reviewed, ...shownOpen.map((m) => m.id)]))}
    >
      <CheckCheck />
      {shownOpen.length
        ? `Mark ${shownOpen.length} shown reviewed`
        : 'All shown reviewed'}
    </Button>
  </div>
</div>
