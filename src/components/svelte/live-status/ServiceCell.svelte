<script lang="ts">
  let { name, region }: { name: string; region: string } = $props()
</script>

<div>
  <div class="font-medium">{name}</div>
  <div class="text-xs text-muted-foreground">{region}</div>
</div>
