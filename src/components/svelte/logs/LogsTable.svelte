<script lang="ts">
  import { createRawSnippet } from 'svelte'
  import { getExpandedRowModel, type ColumnDef } from '@tanstack/table-core'
  import {
    FlexRender,
    renderComponent,
    renderSnippet,
  } from '$lib/components/ui/data-table/index.js'
  import * as Table from '$lib/components/ui/table/index.js'
  import { cn } from '$lib/utils.js'
  import type { LogEntry } from './data'
  import ExpandButton from './ExpandButton.svelte'
  import LoadOlderEvents from './LoadOlderEvents.svelte'
  import LogFields from './LogFields.svelte'
  import LogsToolbar from './LogsToolbar.svelte'
  import NoResults from './NoResults.svelte'
  import { useLogsTable } from './use-logs-table'

  const expandColumn: ColumnDef<LogEntry> = {
    id: 'expand',
    header: () =>
      renderSnippet(
        createRawSnippet(() => ({
          render: () => `<span class="sr-only">Details</span>`,
        })),
      ),
    cell: ({ row }) =>
      renderComponent(ExpandButton, {
        expanded: row.getIsExpanded(),
        ontoggle: () => row.toggleExpanded(),
      }),
  }

  type Props = {
    columns: ColumnDef<LogEntry, any>[]
    data: LogEntry[]
  }

  let { columns, data }: Props = $props()

  const allColumns = $derived([expandColumn, ...columns])

  const table = useLogsTable({
    get data() {
      return data
    },
    get columns() {
      return allColumns
    },
    getRowCanExpand: () => true,
    getExpandedRowModel: getExpandedRowModel(),
  })
</script>

<div class="space-y-3">
  <LogsToolbar {table} />

  <div class="overflow-hidden rounded-md border">
    <Table.Root>
      <Table.Header>
        {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
          <Table.Row>
            {#each headerGroup.headers as header (header.id)}
              <Table.Head
                class={cn(
                  'h-9 text-xs',
                  header.column.id === 'expand' && 'w-8 pr-0',
                  header.column.id === 'message' && 'w-full',
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
            data-state={row.getIsExpanded() ? 'selected' : undefined}
            class={cn(
              'cursor-pointer',
              row.original.level === 'error' &&
                'bg-red-500/[0.04] dark:bg-red-500/[0.07]',
            )}
            onclick={() => row.toggleExpanded()}
          >
            {#each row.getVisibleCells() as cell (cell.id)}
              <Table.Cell
                class={cn(
                  'py-2',
                  cell.column.id === 'expand' && 'pr-0',
                  // max-w-0 lets the message take the leftover width and truncate
                  cell.column.id === 'message' && 'max-w-0 min-w-40',
                )}
              >
                <FlexRender
                  content={cell.column.columnDef.cell}
                  context={cell.getContext()}
                />
              </Table.Cell>
            {/each}
          </Table.Row>
          {#if row.getIsExpanded()}
            <Table.Row class="hover:bg-transparent">
              <Table.Cell colspan={row.getVisibleCells().length} class="bg-muted/30 p-0">
                <LogFields log={row.original} class="px-4 py-3 pl-12" />
              </Table.Cell>
            </Table.Row>
          {/if}
        {:else}
          <Table.Row>
            <Table.Cell
              colspan={table.getVisibleLeafColumns().length}
              class="h-32 text-center"
            >
              <NoResults {table} />
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>

  <LoadOlderEvents {table} />
</div>
