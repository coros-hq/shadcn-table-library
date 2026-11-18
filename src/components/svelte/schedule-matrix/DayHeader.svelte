<script lang="ts">
  import type { Day } from './data'

  let { day }: { day: Day } = $props()
</script>

<div class="flex flex-col items-center leading-tight">
  <span>{day.short}</span>
  <span class="text-xs font-normal text-muted-foreground tabular-nums">
    {day.date}
  </span>
</div>
