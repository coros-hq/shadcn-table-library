<script lang="ts">
  let { amount }: { amount: number } = $props()

  const currency = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  })
</script>

<div class="text-right tabular-nums">{currency.format(amount)}</div>
