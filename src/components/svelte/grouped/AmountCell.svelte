<script lang="ts">
  let { text, bold = false }: { text: string; bold?: boolean } = $props()
</script>

<span class={bold ? 'font-medium' : undefined}>{text}</span>
