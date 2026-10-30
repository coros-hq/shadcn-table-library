<script lang="ts">
  let { name, kind }: { name: string; kind: string } = $props()
</script>

<div>
  <p class="font-medium">{name}</p>
  <p class="text-xs text-muted-foreground">{kind}</p>
</div>
