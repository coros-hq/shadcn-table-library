<script lang="ts">
  import { cn } from '$lib/utils.js'

  type Props = {
    value: string
    numeric?: boolean
    /** The update would change this value */
    changing: boolean
    removed: boolean
  }

  let { value, numeric = false, changing, removed }: Props = $props()
</script>

<span
  class={cn(
    'inline-flex items-center gap-1.5',
    numeric && 'w-full justify-end tabular-nums',
    removed && 'text-muted-foreground line-through',
  )}
>
  {value}
  {#if changing}
    <span
      title="Changes in this update"
      class="size-1.5 shrink-0 rounded-full bg-amber-500"
    ></span>
  {/if}
</span>
