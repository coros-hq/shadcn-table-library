<script lang="ts">
  let { text, muted = false }: { text: string; muted?: boolean } = $props()
</script>

<span class={muted ? 'text-muted-foreground' : 'tabular-nums'}>{text}</span>
