<script lang="ts">
  // Plain text with its own classes
  let { text, class: className = '' }: { text: string; class?: string } =
    $props()
</script>

<span class={className}>{text}</span>
