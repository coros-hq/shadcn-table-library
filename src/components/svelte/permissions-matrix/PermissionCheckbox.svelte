<script lang="ts">
  import { Checkbox } from '$lib/components/ui/checkbox/index.js'
  import * as Tooltip from '$lib/components/ui/tooltip/index.js'
  import { cn } from '$lib/utils.js'
  import { describe } from './permissions'
  import type { CellState } from './permissions'

  type Props = {
    state: CellState
    /** e.g. "Edit Invoices" */
    label: string
    /** Differs from the last save */
    changed: boolean
    onchange: (on: boolean) => void
  }

  let { state, label, changed, onchange }: Props = $props()

  // Inherited and locked grants read as "on, but not yours to change"
  const muted =
    'disabled:opacity-100 data-[state=checked]:border-transparent data-[state=checked]:bg-muted-foreground/25 data-[state=checked]:text-foreground dark:data-[state=checked]:bg-muted-foreground/30'

  const editable = $derived(state.kind === 'granted' || state.kind === 'denied')
  const reason = $derived(describe(state))
</script>

{#if state.kind === 'unavailable'}
  <span class="text-muted-foreground/50" title={reason}>
    <span aria-hidden="true">–</span>
    <span class="sr-only">{label}: {reason}</span>
  </span>
{:else}
  <span class="relative inline-flex">
    {#if editable}
      <Checkbox
        checked={state.kind !== 'denied'}
        onCheckedChange={(value) => onchange(value === true)}
        aria-label={label}
      />
    {:else}
      <!-- A disabled button gets no pointer events, so the tooltip hangs on a wrapper -->
      <Tooltip.Root>
        <Tooltip.Trigger>
          {#snippet child({ props })}
            <span {...props} class="inline-flex">
              <Checkbox
                checked
                disabled
                aria-label="{label}: {reason}"
                class={cn(
                  (state.kind === 'inherited' || state.kind === 'locked') &&
                    muted,
                )}
              />
            </span>
          {/snippet}
        </Tooltip.Trigger>
        <Tooltip.Content>{reason}</Tooltip.Content>
      </Tooltip.Root>
    {/if}
    {#if changed}
      <span
        aria-hidden="true"
        class="absolute -top-1 -right-1 size-1.5 rounded-full bg-amber-500"
      ></span>
    {/if}
  </span>
{/if}
