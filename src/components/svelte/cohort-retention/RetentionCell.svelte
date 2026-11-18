<script lang="ts">
  import { cn } from '$lib/utils.js'
  import { formatCount, formatPercent, needsLightText } from './cohorts'
  import type { Cell, Mode } from './cohorts'
  import { fill, hatch } from './styles'

  // One retention cell. A month the cohort hasn't reached is hatched and
  // says so; a real zero is a plain cell that shows 0.
  type Props = {
    cell: Cell
    mode: Mode
    title: string
    /** What an unavailable cell means here */
    unavailable?: string
  }

  let { cell, mode, title, unavailable = 'Not reached yet' }: Props = $props()
</script>

{#if cell.kind === 'unavailable'}
  <span
    title="{title}: {unavailable.toLowerCase()}"
    class={cn(
      'flex h-9 items-center justify-center rounded-sm text-xs text-muted-foreground/70',
      hatch,
    )}
  >
    <span aria-hidden="true">–</span>
    <span class="sr-only">{unavailable}</span>
  </span>
{:else}
  <span
    title="{title}: {formatCount(cell.count)} users, {formatPercent(cell.percent)}"
    style={fill(cell.percent)}
    class={cn(
      'flex h-9 items-center justify-center rounded-sm text-xs tabular-nums',
      needsLightText(cell.percent) && 'font-medium text-white',
      // A hairline makes an empty-looking zero read as a value
      cell.count === 0 &&
        'text-muted-foreground shadow-[inset_0_0_0_1px_var(--border)]',
    )}
  >
    {mode === 'percent' ? formatPercent(cell.percent) : formatCount(cell.count)}
  </span>
{/if}
