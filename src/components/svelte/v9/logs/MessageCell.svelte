<script lang="ts">
  import Highlight from './Highlight.svelte'

  let { message, query }: { message: string; query: string } = $props()
</script>

<span class="block truncate"><Highlight text={message} {query} /></span>
