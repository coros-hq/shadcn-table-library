<script lang="ts">
  let { uptime }: { uptime: number } = $props()
</script>

<span class="tabular-nums">{uptime.toFixed(2)}%</span>
