<script lang="ts">
  import ChevronRight from '@lucide/svelte/icons/chevron-right'
  import { cn } from '$lib/utils.js'
  import type { Entry } from './data'
  import FileIcon from './FileIcon.svelte'

  // A folder's name opens it; a file's name shows its details
  type Props = {
    entry: Entry
    expanded: boolean
    onopen: () => void
    ontoggle: () => void
  }

  let { entry, expanded, onopen, ontoggle }: Props = $props()

  const button =
    'flex min-w-0 items-center gap-2 rounded-sm text-left outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50'
</script>

{#if entry.kind === 'folder'}
  <button
    type="button"
    data-entry={entry.id}
    onclick={onopen}
    class={cn(button, 'font-medium')}
  >
    <FileIcon {entry} />
    <span class="truncate">{entry.name}</span>
  </button>
{:else}
  <button
    type="button"
    data-entry={entry.id}
    aria-expanded={expanded}
    onclick={ontoggle}
    class={button}
  >
    <FileIcon {entry} />
    <span class="truncate">{entry.name}</span>
    <ChevronRight
      aria-hidden="true"
      class={cn(
        'size-3.5 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none',
        expanded && 'rotate-90',
      )}
    />
    <span class="sr-only">, {expanded ? 'hide' : 'show'} details</span>
  </button>
{/if}
