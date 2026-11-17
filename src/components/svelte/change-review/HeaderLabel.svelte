<script lang="ts">
  // A column heading: right-aligned for numbers, or read only by screen readers
  let { text, class: className }: { text: string; class?: string } = $props()
</script>

<span class={className}>{text}</span>
