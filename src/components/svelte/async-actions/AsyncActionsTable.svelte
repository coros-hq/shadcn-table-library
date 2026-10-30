<script lang="ts">
  import { createRawSnippet, onDestroy } from 'svelte'
  import { getCoreRowModel, type ColumnDef } from '@tanstack/table-core'
  import {
    FlexRender,
    createSvelteTable,
    renderComponent,
    renderSnippet,
  } from '$lib/components/ui/data-table/index.js'
  import * as Table from '$lib/components/ui/table/index.js'
  import { Button } from '$lib/components/ui/button/index.js'
  import { cn } from '$lib/utils.js'
  import LastSyncedCell from './LastSyncedCell.svelte'
  import RowActions from './RowActions.svelte'
  import SourceCell from './SourceCell.svelte'
  import StatusCell from './StatusCell.svelte'
  import { formatLastSynced } from './data'
  import type { Source } from './data'

  // How long the fake request, the exit fade, and the confirm/undo windows last
  const REQUEST_MS = 1500
  const EXIT_MS = 450
  const CONFIRM_MS = 3000
  const UNDO_MS = 6000

  let { initialData }: { initialData: Source[] } = $props()

  // svelte-ignore state_referenced_locally
  let sources = $state<Source[]>(initialData)
  let confirmingId = $state<string | null>(null)
  let leaving = $state<Set<string>>(new Set())
  let archived = $state<{ source: Source; index: number } | null>(null)

  // Every pending timeout, so none fire after unmount or a reset
  const timers = new Set<number>()
  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.delete(id)
      fn()
    }, ms)
    timers.add(id)
    return id
  }
  onDestroy(() => timers.forEach((id) => window.clearTimeout(id)))
  let confirmTimer: number | undefined
  let undoTimer: number | undefined

  const update = (id: string, patch: Partial<Source>) => {
    sources = sources.map((s) => (s.id === id ? { ...s, ...patch } : s))
  }

  function sync(id: string) {
    update(id, { status: 'syncing' })
    later(() => {
      sources = sources.map((s) => {
        if (s.id !== id) return s
        return s.failsNext
          ? {
              ...s,
              status: 'failed',
              error: 'Connection timed out',
              failsNext: false,
            }
          : { ...s, status: 'synced', lastSyncedMin: 0, error: undefined }
      })
    }, REQUEST_MS)
  }

  // Fade the row out first so the icon's motion is visible, then remove it
  function removeAfterExit(
    id: string,
    onRemoved?: (source: Source, index: number) => void,
  ) {
    leaving = new Set(leaving).add(id)
    later(() => {
      const index = sources.findIndex((s) => s.id === id)
      if (index !== -1) onRemoved?.(sources[index], index)
      sources = sources.filter((s) => s.id !== id)
      const next = new Set(leaving)
      next.delete(id)
      leaving = next
    }, EXIT_MS)
  }

  function archive(id: string) {
    removeAfterExit(id, (source, index) => {
      archived = { source, index }
      window.clearTimeout(undoTimer)
      undoTimer = later(() => (archived = null), UNDO_MS)
    })
  }

  function undoArchive() {
    if (!archived) return
    window.clearTimeout(undoTimer)
    const next = [...sources]
    next.splice(Math.min(archived.index, next.length), 0, archived.source)
    sources = next
    archived = null
  }

  function requestDelete(id: string) {
    confirmingId = id
    window.clearTimeout(confirmTimer)
    confirmTimer = later(() => (confirmingId = null), CONFIRM_MS)
  }

  function confirmDelete(id: string) {
    window.clearTimeout(confirmTimer)
    confirmingId = null
    removeAfterExit(id)
  }

  function reset() {
    timers.forEach((id) => window.clearTimeout(id))
    timers.clear()
    sources = initialData
    confirmingId = null
    leaving = new Set()
    archived = null
  }

  // Cell renderers read the state above while rendering, so only the affected
  // cells update when a row's state changes.
  const columns: ColumnDef<Source>[] = [
    {
      accessorKey: 'name',
      header: 'Source',
      cell: ({ row }) =>
        renderComponent(SourceCell, {
          name: row.original.name,
          kind: row.original.kind,
        }),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) =>
        renderComponent(StatusCell, {
          status: row.original.status,
          error: row.original.error,
        }),
    },
    {
      accessorKey: 'lastSyncedMin',
      header: 'Last synced',
      cell: ({ row }) =>
        renderComponent(LastSyncedCell, {
          text: formatLastSynced(row.original.lastSyncedMin),
        }),
    },
    {
      id: 'actions',
      header: () =>
        renderSnippet(
          createRawSnippet(() => ({
            render: () => `<span class="sr-only">Actions</span>`,
          })),
        ),
      cell: ({ row }) => {
        const source = row.original
        return renderComponent(RowActions, {
          source,
          busy: source.status === 'syncing' || leaving.has(source.id),
          confirming: confirmingId === source.id,
          onsync: () => sync(source.id),
          onarchive: () => archive(source.id),
          onrequestdelete: () => requestDelete(source.id),
          onconfirmdelete: () => confirmDelete(source.id),
          oncanceldelete: () => (confirmingId = null),
        })
      },
    },
  ]

  const table = createSvelteTable({
    get data() {
      return sources
    },
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
  })
</script>

<div class="space-y-3">
  <div class="flex flex-wrap items-center justify-between gap-2">
    <p class="text-sm text-muted-foreground">
      Sync, archive, or delete a source. S3 fails its first sync on purpose.
    </p>
    <Button type="button" variant="ghost" size="sm" onclick={reset}>
      Reset demo
    </Button>
  </div>

  <div class="overflow-hidden rounded-md border">
    <Table.Root>
      <Table.Header>
        {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
          <Table.Row>
            {#each headerGroup.headers as header (header.id)}
              <Table.Head>
                <FlexRender
                  content={header.column.columnDef.header}
                  context={header.getContext()}
                />
              </Table.Head>
            {/each}
          </Table.Row>
        {/each}
      </Table.Header>
      <Table.Body>
        {#each table.getRowModel().rows as row (row.id)}
          <Table.Row
            class={cn(
              'transition-opacity duration-300',
              leaving.has(row.id) && 'opacity-0',
            )}
          >
            {#each row.getVisibleCells() as cell (cell.id)}
              <Table.Cell>
                <FlexRender
                  content={cell.column.columnDef.cell}
                  context={cell.getContext()}
                />
              </Table.Cell>
            {/each}
          </Table.Row>
        {:else}
          <Table.Row>
            <Table.Cell
              colspan={columns.length}
              class="h-24 text-center text-muted-foreground"
            >
              No sources left. Use Reset demo to bring them back.
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>

  <div aria-live="polite" class="min-h-9">
    {#if archived}
      <div
        class="flex items-center justify-between gap-3 rounded-md border px-3 py-1.5 text-sm"
      >
        <span>
          Archived <span class="font-medium">{archived.source.name}</span>
        </span>
        <Button
          type="button"
          variant="link"
          size="sm"
          class="h-auto px-0"
          onclick={undoArchive}
        >
          Undo
        </Button>
      </div>
    {/if}
  </div>
</div>
