<script lang="ts">
  import {
    getCoreRowModel,
    getSortedRowModel,
    type ColumnDef,
    type SortingState,
  } from '@tanstack/table-core'
  import ArrowDown from '@lucide/svelte/icons/arrow-down'
  import ArrowUp from '@lucide/svelte/icons/arrow-up'
  import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down'
  import ChevronLeft from '@lucide/svelte/icons/chevron-left'
  import ChevronRight from '@lucide/svelte/icons/chevron-right'
  import ChevronsLeft from '@lucide/svelte/icons/chevrons-left'
  import ChevronsRight from '@lucide/svelte/icons/chevrons-right'
  import { cn } from '$lib/utils.js'
  import {
    FlexRender,
    createSvelteTable,
  } from '$lib/components/ui/data-table/index.js'
  import * as Table from '$lib/components/ui/table/index.js'
  import { Button } from '$lib/components/ui/button/index.js'
  import * as Select from '$lib/components/ui/select/index.js'
  import { getUserPageWithFilter } from '../data'
  import { useServerQuery } from '../useServerQuery.svelte'
  import { useUrlSearch } from '../useUrlSearch.svelte'
  import type { User } from './columns'

  let { columns }: { columns: ColumnDef<User>[] } = $props()

  const PAGES_SIZE = ['10', '20', '30', '40', '50']

  // The URL is the source of truth: page and pageSize live in the query string,
  // not in component state, so a bookmark or refresh reproduces the same view.
  const { search, navigate } = useUrlSearch({ page: 0, pageSize: 10, role: '' })

  const query = useServerQuery(
    () => ({ page: search.page, pageSize: search.pageSize, role: search.role }),
    getUserPageWithFilter,
    { rows: [], pageCount: 0 },
  )

  let sorting = $state<SortingState>([])

  const table = createSvelteTable({
    get data() {
      return query.result.rows
    },
    get columns() {
      return columns
    },
    get pageCount() {
      return query.result.pageCount
    },
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      get sorting() {
        return sorting
      },
      get pagination() {
        return { pageIndex: search.page, pageSize: search.pageSize }
      },
    },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === 'function'
          ? updater({ pageIndex: search.page, pageSize: search.pageSize })
          : updater
      navigate({ page: next.pageIndex, pageSize: next.pageSize })
    },
    onSortingChange: (updater) => {
      sorting = typeof updater === 'function' ? updater(sorting) : updater
    },
  })

</script>

<div>
    <Select.Root
      type="single"
      value={search.role || 'all'}
      onValueChange={(val) =>
        navigate({ role: val === 'all' ? '' : String(val), page: 0 }) // reset to page 0 — the result set size changed
      }
    >
      <Select.Trigger class="mb-4 w-32">
        {search.role || 'All roles'}
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="all" label="All roles">All roles</Select.Item>
        <Select.Item value="Admin" label="Admin">Admin</Select.Item>
        <Select.Item value="Editor" label="Editor">Editor</Select.Item>
        <Select.Item value="Viewer" label="Viewer">Viewer</Select.Item>
      </Select.Content>
    </Select.Root>
  <div
    class={cn('overflow-hidden rounded-md border transition-opacity', query.isPending && 'opacity-50')}
  >
    <Table.Root>
      <Table.Header>
        {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
          <Table.Row>
            {#each headerGroup.headers as header (header.id)}
              {@const canSort = header.column.getCanSort()}
              {@const toggleSorting = header.column.getToggleSortingHandler()}
              <Table.Head
                tabindex={canSort ? 0 : undefined}
                role={canSort ? 'button' : undefined}
                class={canSort ? 'cursor-pointer select-none' : undefined}
                onclick={toggleSorting}
                onkeydown={(e) => {
                  if (canSort && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault()
                    toggleSorting?.(e)
                  }
                }}
              >
                <div class="flex flex-row items-center gap-2">
                  {#if !header.isPlaceholder}
                    <FlexRender
                      content={header.column.columnDef.header}
                      context={header.getContext()}
                    />
                  {/if}
                  {#if canSort}
                    <span>
                      {#if header.column.getIsSorted() === 'asc'}
                        <ArrowUp class="h-3 w-3" />
                      {:else if header.column.getIsSorted() === 'desc'}
                        <ArrowDown class="h-3 w-3" />
                      {:else}
                        <ArrowUpDown class="h-3 w-3 opacity-50" />
                      {/if}
                    </span>
                  {/if}
                </div>
              </Table.Head>
            {/each}
          </Table.Row>
        {/each}
      </Table.Header>
      <Table.Body>
        {#each table.getRowModel().rows as row (row.id)}
          <Table.Row>
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
            <Table.Cell colspan={columns.length} class="h-24 text-center">
              No results.
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>

  <div class="mt-5 flex justify-end gap-1">
    <Button variant="outline" disabled={!table.getCanPreviousPage()} onclick={() => table.firstPage()}>
      <ChevronsLeft class="h-3 w-3" />
    </Button>
    <Button variant="outline" disabled={!table.getCanPreviousPage()} onclick={() => table.previousPage()}>
      <ChevronLeft class="h-3 w-3" />
    </Button>
    <Button variant="outline" disabled={!table.getCanNextPage()} onclick={() => table.nextPage()}>
      <ChevronRight class="h-3 w-3" />
    </Button>
    <Button variant="outline" disabled={!table.getCanNextPage()} onclick={() => table.lastPage()}>
      <ChevronsRight class="h-3 w-3" />
    </Button>
    <Select.Root
      type="single"
      value={search.pageSize.toString()}
      onValueChange={(val) => table.setPageSize(Number(val))}
    >
      <Select.Trigger class="h-1/3">
        {search.pageSize}
      </Select.Trigger>
      <Select.Content>
        <Select.Group>
          {#each PAGES_SIZE as size (size)}
            <Select.Item value={size} label={size}>{size}</Select.Item>
          {/each}
        </Select.Group>
      </Select.Content>
    </Select.Root>
  </div>
</div>
