<script lang="ts">
  import { covered, shiftById } from './data'
  import type { CoveredShift } from './data'
  import ShiftChip from './ShiftChip.svelte'

  // Who is on each shift that day against how many it needs
  let {
    have,
    need,
  }: {
    have: Record<CoveredShift, number>
    need: Record<CoveredShift, number>
  } = $props()
</script>

<ul class="flex flex-col items-center gap-0.5 text-xs tabular-nums">
  {#each covered as shift (shift)}
    {@const short = have[shift] < need[shift]}
    <li
      class="flex items-center gap-1 {short
        ? 'font-semibold text-destructive'
        : ''}"
    >
      <ShiftChip {shift} class="size-4 text-[10px]" />
      <span class="sr-only">{shiftById[shift].label}:</span>
      {have[shift]}/{need[shift]}
      {#if short}<span class="sr-only">(short)</span>{/if}
    </li>
  {/each}
</ul>
