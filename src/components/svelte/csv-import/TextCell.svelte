<script lang="ts">
  // Plain text for the line number, small headers and columns that aren't imported
  let { text, class: className }: { text: string; class?: string } = $props()
</script>

<span class={className}>{text}</span>
