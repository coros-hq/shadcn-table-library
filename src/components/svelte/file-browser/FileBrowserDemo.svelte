<script lang="ts">
  import { tick } from 'svelte'
  import ArrowUp from '@lucide/svelte/icons/arrow-up'
  import ChevronRight from '@lucide/svelte/icons/chevron-right'
  import Download from '@lucide/svelte/icons/download'
  import Trash2 from '@lucide/svelte/icons/trash-2'
  import X from '@lucide/svelte/icons/x'
  import type {
    ExpandedState,
    RowSelectionState,
    SortingState,
  } from '@tanstack/table-core'
  import { Button } from '$lib/components/ui/button/index.js'
  import { root as initialRoot } from './data'
  import type { FolderEntry } from './data'
  import FileTable from './FileTable.svelte'
  import {
    childToward,
    findPath,
    formatSize,
    removeIds,
    sizeOf,
  } from './files'

  // Replaced, never mutated, so raw state is enough
  let tree = $state.raw<FolderEntry>(initialRoot)
  let folderId = $state('all-files/marketing')
  let sorting = $state.raw<SortingState>([])
  let rowSelection = $state.raw<RowSelectionState>({})
  let expanded = $state.raw<ExpandedState>({})
  let message = $state('')

  let nav = $state<HTMLElement>()
  let frame = $state<HTMLElement>()

  // A deleted folder can't stay open: fall back to the root
  const path = $derived(findPath(tree, folderId) ?? [tree])
  const folder = $derived(path[path.length - 1])
  const parent = $derived(path.at(-2))

  /**
   * Opening a folder focuses its name in the breadcrumbs. Going back up
   * focuses the folder you came out of, so you keep your place.
   */
  async function open(id: string) {
    const from = folder.id
    if (id === from) return
    folderId = id
    // Selection and open details belong to the folder you were in
    rowSelection = {}
    expanded = {}
    message = ''
    await tick()
    const el = from.startsWith(`${id}/`)
      ? frame?.querySelector<HTMLElement>(
          `[data-entry="${childToward(id, from)}"]`,
        )
      : nav?.querySelector<HTMLElement>('[aria-current="page"]')
    el?.focus()
  }

  const selected = $derived(folder.children.filter((c) => rowSelection[c.id]))
  const selectedSize = $derived(
    selected.reduce((sum, e) => sum + sizeOf(e), 0),
  )
  const plural = (n: number) => (n === 1 ? 'item' : 'items')

  function download() {
    const n = selected.length
    message = `Preparing ${n} ${plural(n)} (${formatSize(selectedSize)}) for download.`
  }

  function remove() {
    const n = selected.length
    tree = removeIds(tree, new Set(selected.map((e) => e.id)))
    rowSelection = {}
    message = `Deleted ${n} ${plural(n)}.`
  }
</script>

<div bind:this={frame} class="space-y-3">
  <div class="flex min-h-9 flex-wrap items-center gap-2">
    <Button
      variant="outline"
      size="icon"
      class="size-8"
      disabled={!parent}
      aria-label={parent ? `Up to ${parent.name}` : 'Already at the top'}
      onclick={() => parent && open(parent.id)}
    >
      <ArrowUp />
    </Button>
    <nav bind:this={nav} aria-label="Folder path" class="min-w-0 flex-1">
      <ol class="flex flex-wrap items-center gap-0.5 text-sm">
        {#each path as f, i (f.id)}
          <li class="flex min-w-0 items-center gap-0.5">
            {#if i > 0}
              <ChevronRight
                aria-hidden="true"
                class="size-3.5 shrink-0 text-muted-foreground"
              />
            {/if}
            {#if i === path.length - 1}
              <span
                aria-current="page"
                tabindex="-1"
                class="truncate rounded-sm px-1.5 py-1 font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {f.name}
              </span>
            {:else}
              <button
                type="button"
                onclick={() => open(f.id)}
                class="truncate rounded-sm px-1.5 py-1 text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {f.name}
              </button>
            {/if}
          </li>
        {/each}
      </ol>
    </nav>
  </div>

  <div
    class="flex min-h-9 flex-wrap items-center justify-between gap-2 rounded-md bg-muted/50 px-3 py-1.5"
  >
    {#if selected.length}
      <p class="text-sm tabular-nums">
        <span class="font-medium">{selected.length} selected</span>
        <span class="text-muted-foreground">· {formatSize(selectedSize)}</span>
      </p>
      <div class="flex items-center gap-1">
        <Button variant="ghost" size="sm" onclick={download}>
          <Download /> Download
        </Button>
        <Button
          variant="ghost"
          size="sm"
          class="text-destructive hover:text-destructive"
          onclick={remove}
        >
          <Trash2 /> Delete
        </Button>
        <Button
          variant="ghost"
          size="icon"
          class="size-8"
          aria-label="Clear selection"
          onclick={() => (rowSelection = {})}
        >
          <X />
        </Button>
      </div>
    {:else}
      <p class="text-sm text-muted-foreground tabular-nums">
        {folder.children.length}
        {plural(folder.children.length)} · {formatSize(sizeOf(folder))}
      </p>
    {/if}
    <p aria-live="polite" class="w-full text-xs text-muted-foreground empty:hidden">
      {message}
    </p>
  </div>

  <FileTable
    {folder}
    {path}
    meta={{ open }}
    bind:sorting
    bind:rowSelection
    bind:expanded
  />

  <p class="text-xs text-muted-foreground">
    A folder's name opens it. A file's name shows its details.
  </p>
</div>
