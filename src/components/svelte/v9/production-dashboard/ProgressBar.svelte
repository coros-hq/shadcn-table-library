<script lang="ts">
  import { cn } from '$lib/utils.js'

  type Props = {
    /** 0–100. Values above 100 (over-target output) are clamped for display. */
    value: number
    class?: string
    barClassName?: string
  }

  let { value, class: className, barClassName }: Props = $props()

  const clamped = $derived(Math.min(100, Math.max(0, value)))
</script>

<div
  role="progressbar"
  aria-valuenow={Math.round(value)}
  aria-valuemin={0}
  aria-valuemax={100}
  class={cn('h-1.5 w-full overflow-hidden rounded-full bg-muted', className)}
>
  <div
    class={cn('h-full rounded-full bg-foreground', barClassName)}
    style:width="{clamped}%"
  ></div>
</div>
