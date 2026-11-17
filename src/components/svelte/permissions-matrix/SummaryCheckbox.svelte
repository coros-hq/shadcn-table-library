<script lang="ts">
  import { Checkbox } from '$lib/components/ui/checkbox/index.js'
  import { cn } from '$lib/utils.js'
  import type { Summary } from './permissions'

  type Props = {
    summary: Summary
    label: string
    /** Shown above the checkbox, for column headers */
    heading?: string
    onchange: (on: boolean) => void
  }

  let { summary, label, heading, onchange }: Props = $props()

  const muted =
    'disabled:opacity-100 data-[state=checked]:border-transparent data-[state=checked]:bg-muted-foreground/25 data-[state=checked]:text-foreground data-[state=indeterminate]:border-transparent data-[state=indeterminate]:bg-muted-foreground/25 data-[state=indeterminate]:text-foreground'
</script>

{#snippet box()}
  <Checkbox
    checked={summary.checked === true}
    indeterminate={summary.checked === 'indeterminate'}
    disabled={!summary.enabled}
    onCheckedChange={() => onchange(summary.next)}
    aria-label={label}
    class={cn(!summary.enabled && muted)}
  />
{/snippet}

{#if heading}
  <div class="flex flex-col items-center gap-1.5">
    <span>{heading}</span>
    {@render box()}
  </div>
{:else}
  {@render box()}
{/if}
