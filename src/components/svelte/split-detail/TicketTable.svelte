<script lang="ts">
  import type { Table as TanStackTable } from '@tanstack/table-core'
  import { Button } from '$lib/components/ui/button/index.js'
  import { FlexRender } from '$lib/components/ui/data-table/index.js'
  import * as Table from '$lib/components/ui/table/index.js'
  import { cn } from '$lib/utils.js'
  import { columns } from './columns'
  import { PAGE_SIZE } from './styles'
  import type { TicketMeta, TicketRow } from './styles'

  let {
    table,
    panelOpen,
  }: { table: TanStackTable<TicketRow>; panelOpen: boolean } = $props()

  // With the panel open there is less room, and the panel shows priority
  // and assignee anyway, so those two columns step aside
  const hide = (id: string) =>
    panelOpen
      ? id === 'assignee' || id === 'priority'
        ? 'hidden'
        : ''
      : id === 'assignee'
        ? 'hidden md:table-cell'
        : ''

  const openId = $derived((table.options.meta as TicketMeta).openId)
  const pageIndex = $derived(table.getState().pagination.pageIndex)
  const total = $derived(table.getPrePaginationRowModel().rows.length)

  const ariaSort = (sorted: false | 'asc' | 'desc') =>
    sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined
</script>

<div class="flex min-w-0 flex-1 flex-col">
  <!-- Scrolls on its own, so opening a ticket never moves the page -->
  <div class="max-h-[32rem] min-h-[28rem] flex-1 overflow-auto">
    <Table.Root>
      <Table.Header>
        {#each table.getHeaderGroups() as group (group.id)}
          <Table.Row class="hover:bg-transparent">
            {#each group.headers as header (header.id)}
              <Table.Head
                aria-sort={ariaSort(header.column.getIsSorted())}
                class={hide(header.column.id)}
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
            data-ticket-row={row.id}
            aria-current={row.id === openId ? 'true' : undefined}
            class={cn(
              row.id === openId &&
                'bg-muted shadow-[inset_3px_0_0_var(--color-primary)] hover:bg-muted',
            )}
          >
            {#each row.getVisibleCells() as cell (cell.id)}
              <Table.Cell
                class={cn(
                  hide(cell.column.id),
                  cell.column.id === 'subject' && 'w-full max-w-0',
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
          <Table.Row class="hover:bg-transparent">
            <Table.Cell
              colspan={columns.length}
              class="h-40 text-center text-muted-foreground"
            >
              No tickets here.
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
  <div class="flex items-center justify-between gap-2 border-t px-3 py-2">
    <p class="text-sm text-muted-foreground tabular-nums">
      {total
        ? `${pageIndex * PAGE_SIZE + 1}–${Math.min(total, (pageIndex + 1) * PAGE_SIZE)} of ${total}`
        : 'No tickets'}
    </p>
    <div class="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={!table.getCanPreviousPage()}
        onclick={() => table.previousPage()}
      >
        Previous
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={!table.getCanNextPage()}
        onclick={() => table.nextPage()}
      >
        Next
      </Button>
    </div>
  </div>
</div>
