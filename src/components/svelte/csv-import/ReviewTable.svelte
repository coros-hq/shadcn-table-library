<script lang="ts">
  import {
    getCoreRowModel,
    getFilteredRowModel,
  } from '@tanstack/table-core'
  import {
    FlexRender,
    createSvelteTable,
  } from '$lib/components/ui/data-table/index.js'
  import * as Table from '$lib/components/ui/table/index.js'
  import * as Tooltip from '$lib/components/ui/tooltip/index.js'
  import { cn } from '$lib/utils.js'
  import { buildColumns } from './columns'
  import type { ReviewMeta } from './columns'
  import type { ReviewRow, View } from './review'

  type Props = {
    headers: string[]
    rows: ReviewRow[]
    view: View
    meta: ReviewMeta
  }

  let { headers, rows, view, meta }: Props = $props()

  const columns = $derived(buildColumns(headers))
  // A stable array: a new one on every read would recompute the filtered rows
  // each time, and with them TanStack's automatic page reset
  const columnFilters = $derived(
    view === 'all' ? [] : [{ id: 'status', value: view }],
  )

  const table = createSvelteTable({
    get data() {
      return rows
    },
    get columns() {
      return columns
    },
    // Row ids are the row's position in the file, so edits never move or reset a row
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      get columnFilters() {
        return columnFilters
      },
    },
    // No pagination here, so edits have no page to reset
    autoResetPageIndex: false,
    get meta() {
      return meta
    },
  })
</script>

<Tooltip.Provider delayDuration={150}>
  <div class="rounded-md border">
    <Table.Root>
      <Table.Header>
        {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
          <Table.Row class="hover:bg-transparent">
            {#each headerGroup.headers as header (header.id)}
              <Table.Head class="h-auto align-bottom">
                <div class="flex min-h-9 items-center">
                  <FlexRender
                    content={header.column.columnDef.header}
                    context={header.getContext()}
                  />
                </div>
              </Table.Head>
            {/each}
          </Table.Row>
        {/each}
      </Table.Header>
      <Table.Body>
        {#each table.getRowModel().rows as row (row.id)}
          <Table.Row
            class={cn(
              row.original.status === 'skipped' &&
                '[&>td:not(:first-child)]:opacity-50',
            )}
          >
            {#each row.getVisibleCells() as cell (cell.id)}
              <Table.Cell class="py-1.5">
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
              class="h-24 text-center text-muted-foreground"
            >
              {view === 'attention'
                ? 'Nothing left to fix.'
                : view === 'skipped'
                  ? 'No rows are skipped.'
                  : 'No rows here.'}
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
</Tooltip.Provider>
