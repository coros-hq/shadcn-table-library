<script lang="ts">
  import {
    FlexRender,
    createTable,
    type ExpandedState,
    type SortingState,
  } from '@tanstack/svelte-table'
  import { v9Features } from '$lib/table-v9-features'
  import ArrowDown from '@lucide/svelte/icons/arrow-down'
  import ArrowUp from '@lucide/svelte/icons/arrow-up'
  import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down'
  import * as Table from '$lib/components/ui/table/index.js'
  import type { InventoryTableMeta, SkuRow } from './columns'
  import { columns } from './columns'
  import BatchDetail from './BatchDetail.svelte'

  let { data, meta }: { data: SkuRow[]; meta: InventoryTableMeta } = $props()

  let sorting = $state<SortingState>([{ id: 'status', desc: false }])
  let expanded = $state<ExpandedState>({ 'SKU-1042': true })

  const table = createTable({
    features: v9Features,
    get data() {
      return data
    },
    columns,
    get meta() {
      return meta
    },
    state: {
      get sorting() {
        return sorting
      },
      get expanded() {
        return expanded
      },
    },
    onSortingChange: (updater) => {
      sorting = typeof updater === 'function' ? updater(sorting) : updater
    },
    onExpandedChange: (updater) => {
      expanded = typeof updater === 'function' ? updater(expanded) : updater
    },
    // Rows are keyed by SKU, not array index, so expansion follows the SKU
    // when a formula-backed sort (e.g. Status) moves it after an edit.
    getRowId: (row) => row.sku,
    // Batches aren't subRows of the same shape — the detail panel is custom
    // markup — so every row can expand without a getSubRows.
    getRowCanExpand: () => true,
    // Every edit produces a new `data` array; without this, TanStack would
    // collapse all rows each time a cell is saved.
    autoResetExpanded: false,
  })
</script>

<div class="overflow-hidden rounded-md border">
  <Table.Root>
    <Table.Header>
      {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
        <Table.Row>
          {#each headerGroup.headers as header (header.id)}
            {@const sorted = header.column.getIsSorted()}
            <Table.Head
              aria-sort={sorted === 'asc'
                ? 'ascending'
                : sorted === 'desc'
                  ? 'descending'
                  : undefined}
              class="whitespace-nowrap"
            >
              {#if !header.isPlaceholder}
                {#if header.column.getCanSort()}
                  <button
                    type="button"
                    class="flex items-center gap-2"
                    onclick={header.column.getToggleSortingHandler()}
                  >
                    <FlexRender {header} />
                    {#if sorted === 'asc'}
                      <ArrowUp class="size-3" />
                    {:else if sorted === 'desc'}
                      <ArrowDown class="size-3" />
                    {:else}
                      <ArrowUpDown class="size-3 opacity-50" />
                    {/if}
                  </button>
                {:else}
                  <FlexRender {header} />
                {/if}
              {/if}
            </Table.Head>
          {/each}
        </Table.Row>
      {/each}
    </Table.Header>
    <Table.Body>
      {#each table.getRowModel().rows as row (row.id)}
        <Table.Row data-state={row.getIsExpanded() ? 'selected' : undefined}>
          {#each row.getVisibleCells() as cell (cell.id)}
            <Table.Cell>
              <FlexRender {cell} />
            </Table.Cell>
          {/each}
        </Table.Row>
        {#if row.getIsExpanded()}
          <Table.Row class="hover:bg-transparent">
            <Table.Cell
              colspan={table.getVisibleLeafColumns().length}
              class="bg-muted/30 p-4"
            >
              <BatchDetail row={row.original} {meta} />
            </Table.Cell>
          </Table.Row>
        {/if}
      {:else}
        <Table.Row>
          <Table.Cell
            colspan={table.getVisibleLeafColumns().length}
            class="h-24 text-center"
          >
            No results.
          </Table.Cell>
        </Table.Row>
      {/each}
    </Table.Body>
    <Table.Footer>
      {#each table.getFooterGroups() as footerGroup (footerGroup.id)}
        <Table.Row>
          {#each footerGroup.headers as header (header.id)}
            <Table.Cell class="font-medium">
              <FlexRender {header} />
            </Table.Cell>
          {/each}
        </Table.Row>
      {/each}
    </Table.Footer>
  </Table.Root>
</div>
