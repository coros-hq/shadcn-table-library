<script lang="ts" generics="TData extends RowData">
  import {
    FlexRender,
    createTable,
    type ColumnDef,
    type ExpandedState,
    type GroupingState,
    type RowData,
  } from '@tanstack/svelte-table'
  import { v9Features, type V9Features } from '$lib/table-v9-features'
  import { cn } from '$lib/utils.js'
  import * as Table from '$lib/components/ui/table/index.js'

  type Props = {
    columns: ColumnDef<V9Features, TData, any>[]
    data: TData[]
    groupBy: string
  }

  let { columns, data, groupBy }: Props = $props()

  // svelte-ignore state_referenced_locally
  let grouping = $state<GroupingState>([groupBy])
  let expanded = $state<ExpandedState>(true)

  const table = createTable({
    features: v9Features,
    get data() {
      return data
    },
    get columns() {
      return columns
    },
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
                <FlexRender {header} />
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
              <FlexRender {cell} />
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
