<script lang="ts">
  let { name, sku, batchCount }: { name: string; sku: string; batchCount: number } = $props()
</script>

<div class="min-w-40">
  <p class="font-medium">{name}</p>
  <p class="font-mono text-xs text-muted-foreground">
    {sku} · {batchCount} {batchCount === 1 ? 'batch' : 'batches'}
  </p>
</div>
