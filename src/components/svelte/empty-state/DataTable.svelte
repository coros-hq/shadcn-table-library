<script lang="ts">
  import {
    getCoreRowModel,
    getFilteredRowModel,
  } from '@tanstack/table-core'
  import Inbox from '@lucide/svelte/icons/inbox'
  import Plus from '@lucide/svelte/icons/plus'
  import SearchX from '@lucide/svelte/icons/search-x'
  import {
    FlexRender,
    createSvelteTable,
  } from '$lib/components/ui/data-table/index.js'
  import { Button } from '$lib/components/ui/button/index.js'
  import { Input } from '$lib/components/ui/input/index.js'
  import * as Table from '$lib/components/ui/table/index.js'
  import EmptyState from './EmptyState.svelte'
  import { columns } from './columns'
  import type { Invoice } from './data'

  let { data, oncreate }: { data: Invoice[]; oncreate?: () => void } = $props()

  let globalFilter = $state('')

  const table = createSvelteTable({
    get data() {
      return data
    },
    columns,
    state: {
      get globalFilter() {
        return globalFilter
      },
    },
    onGlobalFilterChange: (updater) => {
      globalFilter =
        typeof updater === 'function' ? updater(globalFilter) : updater
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })
</script>

<div class="space-y-3">
  <Input
    bind:value={globalFilter}
    placeholder="Search invoices..."
    disabled={data.length === 0}
    class="max-w-xs"
  />
  <div class="overflow-hidden rounded-md border">
    <Table.Root>
      <Table.Header>
        {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
          <Table.Row>
            {#each headerGroup.headers as header (header.id)}
              <Table.Head>
                {#if !header.isPlaceholder}
                  <FlexRender
                    content={header.column.columnDef.header}
                    context={header.getContext()}
                  />
                {/if}
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
          <Table.Row class="hover:bg-transparent">
            <Table.Cell colspan={columns.length} class="p-0">
              <!-- Two different empties: nothing exists yet vs. nothing matches the filter -->
              {#if data.length === 0}
                <EmptyState
                  title="No invoices yet"
                  description="Invoices you create will show up here so you can track what's paid and what's overdue."
                >
                  {#snippet icon()}<Inbox />{/snippet}
                  {#snippet action()}
                    <Button size="sm" onclick={() => oncreate?.()}>
                      <Plus /> Create invoice
                    </Button>
                  {/snippet}
                </EmptyState>
              {:else}
                <EmptyState
                  title="No results found"
                  description={`Nothing matches "${globalFilter}". Try a different search term.`}
                >
                  {#snippet icon()}<SearchX />{/snippet}
                  {#snippet action()}
                    <Button
                      variant="outline"
                      size="sm"
                      onclick={() => (globalFilter = '')}
                    >
                      Clear search
                    </Button>
                  {/snippet}
                </EmptyState>
              {/if}
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
</div>
