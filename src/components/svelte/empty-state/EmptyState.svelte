<script lang="ts">
  import type { Snippet } from 'svelte'
  import { cn } from '$lib/utils.js'

  type Props = {
    title: string
    description: string
    class?: string
    icon?: Snippet
    // Primary call to action, e.g. a "Create" or "Clear filters" button
    action?: Snippet
  }

  let { title, description, class: className, icon, action }: Props = $props()
</script>

<div
  class={cn(
    'flex flex-col items-center justify-center gap-3 px-6 py-14 text-center',
    className,
  )}
>
  <div
    class="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground [&_svg]:size-5"
  >
    {@render icon?.()}
  </div>
  <div class="space-y-1">
    <p class="text-sm font-medium">{title}</p>
    <p class="max-w-sm text-sm text-balance text-muted-foreground">
      {description}
    </p>
  </div>
  {@render action?.()}
</div>
