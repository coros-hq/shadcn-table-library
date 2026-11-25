<script lang="ts">
  import { cn } from '$lib/utils.js'

  let { name, archived }: { name: string; archived: boolean } = $props()
</script>

<span class={cn(archived && 'text-muted-foreground line-through')}>{name}</span>
