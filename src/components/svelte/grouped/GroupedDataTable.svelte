<script lang="ts" generics="TData">
  import {
    getCoreRowModel,
    getExpandedRowModel,
    getGroupedRowModel,
    type ColumnDef,
    type ExpandedState,
    type GroupingState,
  } from '@tanstack/table-core'
  import { cn } from '$lib/utils.js'
  import {
    FlexRender,
    createSvelteTable,
  } from '$lib/components/ui/data-table/index.js'
  import * as Table from '$lib/components/ui/table/index.js'

  type Props = {
    columns: ColumnDef<TData, any>[]
    data: TData[]
    groupBy: string
  }

  let { columns, data, groupBy }: Props = $props()

  // svelte-ignore state_referenced_locally
  let grouping = $state<GroupingState>([groupBy])
  let expanded = $state<ExpandedState>(true)

  const table = createSvelteTable({
    get data() {
      return data
    },
    get columns() {
      return columns
    },
    getCoreRowModel: getCoreRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onGroupingChange: (updater) => {
      grouping = typeof updater === 'function' ? updater(grouping) : updater
    },
    onExpandedChange: (updater) => {
      expanded = typeof updater === 'function' ? updater(expanded) : updater
    },
    state: {
      get grouping() {
        return grouping
      },
      get expanded() {
        return expanded
      },
    },
  })
</script>

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
        <Table.Row class={cn(row.getIsGrouped() && 'bg-muted/50')}>
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
