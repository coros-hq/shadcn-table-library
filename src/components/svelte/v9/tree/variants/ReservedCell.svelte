<script lang="ts">
  const number = new Intl.NumberFormat('en-US')

  let { reserved }: { reserved: number } = $props()
</script>

<div class="text-right tabular-nums">{number.format(reserved)}</div>
