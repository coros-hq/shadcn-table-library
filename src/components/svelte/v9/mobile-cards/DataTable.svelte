<script lang="ts" generics="TData extends RowData">
  import {
    FlexRender,
    createTable,
    type ColumnDef,
    type RowData,
  } from '@tanstack/svelte-table'
  import { v9Features, type V9Features } from '$lib/table-v9-features'
  import * as Table from '$lib/components/ui/table/index.js'
  import { cn } from '$lib/utils.js'

  type Props = {
    columns: ColumnDef<V9Features, TData, any>[]
    data: TData[]
  }

  let { columns, data }: Props = $props()

  const table = createTable({
    features: v9Features,
    get data() {
      return data
    },
    get columns() {
      return columns
    },
  })
</script>

<!--
  Below the @[48rem] (768px) container breakpoint, every table element is
  forced to `block`/`flex` and each <tr> becomes its own bordered card.
  Above it, the variant puts everything back to its normal table display —
  no JS media query, no separate mobile component. Tailwind's @[...]
  variants key off this container's own width via `@container`, not the
  viewport, so the same table card-ifies inside a narrow sidebar even on a
  wide desktop screen.
-->
<div class="@container rounded-md border">
  <Table.Root class="block @[48rem]:table">
    <Table.Header class="hidden @[48rem]:table-header-group">
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
    <Table.Body class="block space-y-3 @[48rem]:table-row-group @[48rem]:space-y-0">
      {#each table.getRowModel().rows as row (row.id)}
        <Table.Row
          class="block rounded-lg border p-3 @[48rem]:table-row @[48rem]:rounded-none @[48rem]:border-0 @[48rem]:border-b @[48rem]:p-0 @[48rem]:last:border-b-0"
        >
          {#each row.getVisibleCells() as cell, cellIndex (cell.id)}
            <Table.Cell
              data-label={typeof cell.column.columnDef.header === 'string'
                ? cell.column.columnDef.header
                : undefined}
              class={cn(
                'flex items-center justify-between gap-4 py-1 @[48rem]:table-cell @[48rem]:py-3',
                cellIndex === 0
                  ? 'mb-1 text-sm font-medium @[48rem]:mb-0 @[48rem]:font-normal'
                  : 'border-t py-1.5 first:border-t-0 @[48rem]:border-t-0 @[48rem]:py-3 before:content-[attr(data-label)] before:text-xs before:font-medium before:text-muted-foreground @[48rem]:before:content-none',
              )}
            >
              <FlexRender {cell} />
            </Table.Cell>
          {/each}
        </Table.Row>
      {:else}
        <Table.Row class="block @[48rem]:table-row">
          <Table.Cell
            colspan={columns.length}
            class="block h-24 text-center @[48rem]:table-cell"
          >
            No results.
          </Table.Cell>
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
</div>
