<script lang="ts">
  import X from '@lucide/svelte/icons/x'
  import { Button } from '$lib/components/ui/button/index.js'
  import { cn } from '$lib/utils.js'
  import CohortTable from './CohortTable.svelte'
  import { compare } from './cohorts'
  import type { Mode } from './cohorts'
  import { cohorts } from './data'
  import { hatch, hue } from './styles'
  import type { CohortMeta } from './styles'

  const modes: { id: Mode; label: string }[] = [
    { id: 'percent', label: 'Percent' },
    { id: 'count', label: 'Users' },
  ]

  let mode = $state<Mode>('percent')
  let highlighted = $state<string | null>(null)

  const cohort = $derived(cohorts.find((c) => c.id === highlighted))

  const meta: CohortMeta = $derived({
    mode,
    highlighted,
    toggle: (id) => (highlighted = highlighted === id ? null : id),
  })

  function clear() {
    const id = highlighted
    highlighted = null
    document.querySelector<HTMLElement>(`[data-cohort="${id}"]`)?.focus()
  }
</script>

<div class="space-y-3">
  <div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
    <div
      role="group"
      aria-label="Show retention as"
      class="inline-flex rounded-md border p-0.5"
    >
      {#each modes as m (m.id)}
        <button
          type="button"
          aria-pressed={mode === m.id}
          onclick={() => (mode = m.id)}
          class="flex h-7 items-center rounded px-2.5 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:bg-muted aria-pressed:text-foreground"
        >
          {m.label}
        </button>
      {/each}
    </div>
    <ul
      aria-label="Legend"
      class={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground',
        hue,
      )}
    >
      <li class="flex items-center gap-1.5">
        <span>0%</span>
        <span
          aria-hidden="true"
          class="h-2.5 w-20 rounded-sm bg-[linear-gradient(to_right,transparent,var(--cohort))] shadow-[inset_0_0_0_1px_var(--border)]"
        ></span>
        <span>60%+ retained</span>
      </li>
      <li class="flex items-center gap-1.5">
        <span
          aria-hidden="true"
          class="size-3 rounded-sm shadow-[inset_0_0_0_1px_var(--border)]"
        ></span>
        Zero: nobody came back
      </li>
      <li class="flex items-center gap-1.5">
        <span aria-hidden="true" class={cn('size-3 rounded-sm', hatch)}></span>
        Not reached yet
      </li>
    </ul>
  </div>

  <CohortTable {meta} />

  <div
    class="flex min-h-9 items-center justify-between gap-3 rounded-md bg-muted/50 px-3 py-1.5"
  >
    <p aria-live="polite" class="text-sm text-muted-foreground">
      {cohort
        ? compare(cohort, cohorts)
        : 'Pick a cohort to highlight it and compare it with the average.'}
    </p>
    {#if cohort}
      <Button
        variant="ghost"
        size="icon"
        class="size-7 shrink-0"
        aria-label="Clear highlight"
        onclick={clear}
      >
        <X />
      </Button>
    {/if}
  </div>
</div>
