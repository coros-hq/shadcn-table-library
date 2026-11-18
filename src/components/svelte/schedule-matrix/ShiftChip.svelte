<script lang="ts">
  import { cn } from '$lib/utils.js'
  import { shiftById } from './data'
  import type { ShiftId } from './data'
  import { shiftTone } from './tone'

  // A shift's letter in its color, as in the cells and the legend
  let { shift, class: className }: { shift: ShiftId; class?: string } =
    $props()
</script>

<span
  aria-hidden="true"
  class={cn(
    'inline-flex size-5 shrink-0 items-center justify-center rounded text-[11px] font-semibold',
    shiftTone[shift],
    className,
  )}
>
  {shiftById[shift].code}
</span>
