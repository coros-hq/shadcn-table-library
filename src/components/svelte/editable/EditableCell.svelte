<script lang="ts">
  import { Input } from '$lib/components/ui/input/index.js'
  import { cn } from '$lib/utils.js'

  type Props = {
    display: string
    type: 'text' | 'number'
    isEditing: boolean
    isPending: boolean
    error?: string
    draft: string
    onstart: () => void
    ondraft: (value: string) => void
    oncommit: () => void
    oncancel: () => void
  }

  let {
    display,
    type,
    isEditing,
    isPending,
    error,
    draft,
    onstart,
    ondraft,
    oncommit,
    oncancel,
  }: Props = $props()
</script>

{#if isEditing}
  <Input
    value={draft}
    {type}
    class="h-7 px-2"
    oninput={(e) => ondraft(e.currentTarget.value)}
    onblur={oncommit}
    onkeydown={(e) => {
      if (e.key === 'Enter') oncommit()
      if (e.key === 'Escape') oncancel()
    }}
    {@attach (el) => el.focus()}
  />
{:else}
  <button
    type="button"
    onclick={onstart}
    class={cn(
      'w-full rounded px-1.5 py-1 text-left hover:bg-muted',
      isPending && 'opacity-50',
      error && 'text-destructive',
    )}
  >
    {error ?? display}
  </button>
{/if}
