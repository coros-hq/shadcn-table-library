<script lang="ts">
  import type { ColumnDef } from '@tanstack/table-core'
  import {
    FlexRender,
  } from '$lib/components/ui/data-table/index.js'
  import * as Table from '$lib/components/ui/table/index.js'
  import { cn } from '$lib/utils.js'
  import type { LogEntry } from './data'
  import LoadOlderEvents from './LoadOlderEvents.svelte'
  import LogPanel from './LogPanel.svelte'
  import LogsToolbar from './LogsToolbar.svelte'
  import NoResults from './NoResults.svelte'
  import { useLogsTable } from './use-logs-table'

  // The panel takes the room these columns would use; its header repeats them
  const hiddenWhileOpen = { service: false, statusClass: false }

  type Props = {
    columns: ColumnDef<LogEntry, any>[]
    data: LogEntry[]
  }

  let { columns, data }: Props = $props()

  let selectedId = $state<string | null>(null)

  const table = useLogsTable({
    get data() {
      return data
    },
    get columns() {
      return columns
    },
    state: {
      get columnVisibility() {
        return selectedId ? hiddenWhileOpen : {}
      },
    },
  })

  const rows = $derived(table.getRowModel().rows)
  const selectedIndex = $derived(rows.findIndex((row) => row.id === selectedId))
  const selected = $derived(selectedIndex === -1 ? undefined : rows[selectedIndex])

  // A filter can remove the selected event; close the panel instead of
  // showing details for a row that is no longer in the table
  $effect(() => {
    if (selectedId && !selected) selectedId = null
  })

  function selectAt(index: number) {
    const row = rows.at(index)
    if (index < 0 || !row) return
    selectedId = row.id
    document.getElementById(`log-row-${row.id}`)?.focus()
  }

  function onRowKeyDown(e: KeyboardEvent, index: number) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      selectAt(index + (e.key === 'ArrowDown' ? 1 : -1))
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      const id = rows[index].id
      selectedId = id === selectedId ? null : id
    } else if (e.key === 'Escape') {
      selectedId = null
    }
  }
</script>

<div class="space-y-3">
  <LogsToolbar {table} />

  <!-- overflow-clip (not hidden) keeps the rounded corners without
       breaking the panel's sticky positioning -->
  <div class="relative flex overflow-clip rounded-md border">
    <div class="min-w-0 flex-1">
      <Table.Root>
        <Table.Header>
          {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
            <Table.Row>
              {#each headerGroup.headers as header (header.id)}
                <Table.Head
                  class={cn('h-9 text-xs', header.column.id === 'message' && 'w-full')}
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
          {#each rows as row, index (row.id)}
            <Table.Row
              id="log-row-{row.id}"
              tabindex={0}
              aria-selected={row.id === selectedId}
              data-state={row.id === selectedId ? 'selected' : undefined}
              class={cn(
                'cursor-pointer outline-none focus-visible:bg-muted/60',
                row.original.level === 'error' &&
                  'bg-red-500/[0.04] dark:bg-red-500/[0.07]',
              )}
              onclick={() => (selectedId = row.id === selectedId ? null : row.id)}
              onkeydown={(e: KeyboardEvent) => onRowKeyDown(e, index)}
            >
              {#each row.getVisibleCells() as cell (cell.id)}
                <Table.Cell
                  class={cn(
                    'py-2',
                    // max-w-0 lets the message take the leftover width and truncate
                    cell.column.id === 'message' && 'max-w-0 min-w-32',
                  )}
                >
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

    {#if selected}
      <LogPanel
        row={selected}
        canPrevious={selectedIndex > 0}
        canNext={selectedIndex < rows.length - 1}
        onprevious={() => selectAt(selectedIndex - 1)}
        onnext={() => selectAt(selectedIndex + 1)}
        onclose={() => (selectedId = null)}
      />
    {/if}
  </div>

  <LoadOlderEvents {table} />
</div>
