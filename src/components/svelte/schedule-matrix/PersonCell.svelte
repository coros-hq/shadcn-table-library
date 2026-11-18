<script lang="ts">
  // Two lines in the first column: a main line and a muted one below it
  let { title, subtitle }: { title: string; subtitle: string } = $props()
</script>

<div class="flex min-w-0 flex-col">
  <span class="truncate font-medium">{title}</span>
  <span class="truncate text-xs text-muted-foreground">{subtitle}</span>
</div>
