<script lang="ts">
  import { formatDay, formatTime } from './data'

  let { timestamp }: { timestamp: number } = $props()
</script>

<span class="whitespace-nowrap tabular-nums">
  <span class="text-muted-foreground">{formatDay(timestamp)}</span>
  {' '}{formatTime(timestamp)}
</span>
