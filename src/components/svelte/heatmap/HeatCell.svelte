<script lang="ts">
  import { cn } from '$lib/utils.js'

  let {
    text,
    backgroundColor,
    isDark,
  }: { text: string; backgroundColor: string; isDark: boolean } = $props()
</script>

<div
  style:background-color={backgroundColor}
  class={cn(
    'flex h-full w-full items-center justify-center px-3 py-2.5 text-sm tabular-nums',
    isDark ? 'text-white' : 'text-foreground',
  )}
>
  {text}
</div>
