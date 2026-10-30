<script lang="ts">
  let { mrr }: { mrr: number } = $props()

  const usd = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })
</script>

<span class="tabular-nums">{usd.format(mrr)}</span>
