<script lang="ts">
  import CircleAlert from '@lucide/svelte/icons/circle-alert'
  import Copy from '@lucide/svelte/icons/copy'
  import { Input } from '$lib/components/ui/input/index.js'
  import * as Tooltip from '$lib/components/ui/tooltip/index.js'
  import { cn } from '$lib/utils.js'
  import type { Issue } from './review'

  // A cell of a mapped column. Problems are shown in place, and clicking the
  // cell opens an input to fix the value. Any value is accepted on commit: the
  // review runs again and the highlight goes away once the value is valid.
  type Props = {
    value: string
    issue?: Issue
    /** e.g. "Email, line 4" */
    label: string
    oncommit: (value: string) => void
  }

  let { value, issue, label, oncommit }: Props = $props()

  let draft = $state<string | null>(null)

  function done(save: boolean) {
    if (draft === null) return
    if (save && draft !== value) oncommit(draft)
    draft = null
  }

  let input = $state<HTMLInputElement | null>(null)
  $effect(() => {
    input?.focus()
  })
</script>

{#snippet button(props: Record<string, unknown> = {})}
  <button
    {...props}
    type="button"
    onclick={() => (draft = value)}
    aria-label="{label}: {value || 'empty'}{issue
      ? `. ${issue.message}`
      : ''}. Edit"
    class={cn(
      'flex h-8 w-full min-w-24 items-center gap-1.5 rounded-md px-2 text-left outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50',
      issue?.kind === 'invalid' &&
        'bg-destructive/10 text-destructive ring-1 ring-destructive/30 ring-inset hover:bg-destructive/15',
      issue?.kind === 'duplicate' &&
        'bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/40 ring-inset hover:bg-amber-500/15 dark:text-amber-400',
    )}
  >
    <span class={cn('truncate', !value && 'italic opacity-70')}>
      {value || 'Empty'}
    </span>
    {#if issue?.kind === 'invalid'}
      <CircleAlert class="ml-auto size-3.5 shrink-0" />
    {:else if issue?.kind === 'duplicate'}
      <Copy class="ml-auto size-3.5 shrink-0" />
    {/if}
  </button>
{/snippet}

{#if draft !== null}
  <Input
    bind:ref={input}
    bind:value={draft}
    aria-label={label}
    class="h-8 min-w-32"
    onblur={() => done(true)}
    onkeydown={(e) => {
      if (e.key === 'Enter') done(true)
      if (e.key === 'Escape') done(false)
    }}
  />
{:else if issue}
  <Tooltip.Root>
    <Tooltip.Trigger>
      {#snippet child({ props })}
        {@render button(props)}
      {/snippet}
    </Tooltip.Trigger>
    <Tooltip.Content>{issue.message}</Tooltip.Content>
  </Tooltip.Root>
{:else}
  {@render button()}
{/if}
