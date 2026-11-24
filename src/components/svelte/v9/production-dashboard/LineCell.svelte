<script lang="ts">
  let { line, shift }: { line: string; shift: string } = $props()
</script>

<div>
  <p class="font-medium">{line}</p>
  <p class="text-xs text-muted-foreground">{shift}</p>
</div>
