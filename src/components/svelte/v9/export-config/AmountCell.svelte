<script lang="ts">
  let { amount }: { amount: number } = $props()

  const usd = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  })
</script>

<span class="tabular-nums">{usd.format(amount)}</span>
