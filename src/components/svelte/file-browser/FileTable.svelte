<script lang="ts">
  import FolderOpen from '@lucide/svelte/icons/folder-open'
  import { getCoreRowModel, getExpandedRowModel } from '@tanstack/table-core'
  import type {
    ExpandedState,
    RowSelectionState,
    SortingState,
  } from '@tanstack/table-core'
  import {
    FlexRender,
    createSvelteTable,
  } from '$lib/components/ui/data-table/index.js'
  import * as Table from '$lib/components/ui/table/index.js'
  import { cn } from '$lib/utils.js'
  import { columns } from './columns'
  import type { BrowserMeta } from './columns'
  import type { FolderEntry } from './data'
  import FileDetails from './FileDetails.svelte'
  import { sortEntries } from './files'
  import type { SortKey } from './files'

  let {
    folder,
    path,
    meta,
    // Owned by the demo, which resets them when the folder changes
    sorting = $bindable(),
    rowSelection = $bindable(),
    expanded = $bindable(),
  }: {
    folder: FolderEntry
    /** The folders from the root to `folder`, for the details' location */
    path: FolderEntry[]
    meta: BrowserMeta
    sorting: SortingState
    rowSelection: RowSelectionState
    expanded: ExpandedState
  } = $props()

  // Secondary columns step aside on small screens; the details row has them
  const responsive: Record<string, string> = {
    kind: 'hidden md:table-cell',
    owner: 'hidden lg:table-cell',
    modified: 'hidden sm:table-cell',
  }

  // Sorted here rather than by TanStack, so folders stay on top either way
  const entries = $derived.by(() => {
    const sort = sorting.at(0)
    return sortEntries(
      folder.children,
      sort
        ? { id: sort.id as SortKey, desc: sort.desc }
        : { id: 'name', desc: false },
    )
  })

  const update = <T,>(updater: T | ((old: T) => T), old: T) =>
    typeof updater === 'function' ? (updater as (old: T) => T)(old) : updater

  const table = createSvelteTable({
    get data() {
      return entries
    },
    columns,
    getRowId: (entry) => entry.id,
    getRowCanExpand: (row) => row.original.kind === 'file',
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    manualSorting: true,
    enableMultiSort: false,
    state: {
      get sorting() {
        return sorting
      },
      get rowSelection() {
        return rowSelection
      },
      get expanded() {
        return expanded
      },
    },
    onSortingChange: (u) => (sorting = update(u, sorting)),
    onRowSelectionChange: (u) => (rowSelection = update(u, rowSelection)),
    onExpandedChange: (u) => (expanded = update(u, expanded)),
    get meta() {
      return meta
    },
  })

  const ariaSort = (sorted: false | 'asc' | 'desc') =>
    sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined
</script>

<div class="overflow-hidden rounded-md border">
  <Table.Root>
    <Table.Header>
      {#each table.getHeaderGroups() as group (group.id)}
        <Table.Row class="hover:bg-transparent">
          {#each group.headers as header (header.id)}
            <Table.Head
              aria-sort={ariaSort(header.column.getIsSorted())}
              class={cn(
                responsive[header.column.id],
                header.column.id === 'select' && 'w-10',
                header.column.id === 'size' && 'w-28',
              )}
            >
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
          data-state={row.getIsSelected() ? 'selected' : undefined}
          class={cn(row.getIsExpanded() && 'border-b-0')}
        >
          {#each row.getVisibleCells() as cell (cell.id)}
            <Table.Cell
              class={cn(
                responsive[cell.column.id],
                cell.column.id === 'name' && 'max-w-0 w-full',
              )}
            >
              <FlexRender
                content={cell.column.columnDef.cell}
                context={cell.getContext()}
              />
            </Table.Cell>
          {/each}
        </Table.Row>
        {#if row.getIsExpanded() && row.original.kind === 'file'}
          <Table.Row class="bg-muted/30 hover:bg-muted/30">
            <Table.Cell />
            <Table.Cell colspan={columns.length - 1}>
              <FileDetails file={row.original} {path} />
            </Table.Cell>
          </Table.Row>
        {/if}
      {:else}
        <Table.Row class="hover:bg-transparent">
          <Table.Cell colspan={columns.length} class="h-40">
            <div
              class="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground"
            >
              <FolderOpen aria-hidden="true" class="size-6" />
              This folder is empty
            </div>
          </Table.Cell>
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
</div>
