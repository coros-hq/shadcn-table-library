<script lang="ts">
  let { amount }: { amount: number } = $props()

  const money = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  })
</script>

<div class="text-right tabular-nums">{money.format(amount)}</div>
