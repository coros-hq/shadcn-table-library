<script lang="ts">
  let { salary }: { salary: number } = $props()

  const currency = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })
</script>

<div class="text-right font-medium tabular-nums">{currency.format(salary)}</div>
