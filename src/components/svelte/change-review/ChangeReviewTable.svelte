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
  import { cn } from '$lib/utils.js'
  import { columns } from './columns'
  import type { ReviewMeta } from './columns'
  import { rowState } from './diff'
  import type { View } from './diff'
  import type { CatalogRow } from './data'

  type Props = {
    rows: CatalogRow[]
    view: View
    /** The product whose diff is open, highlighted while the panel shows it */
    openId: string | null
    meta: ReviewMeta
  }

  let { rows, view, openId, meta }: Props = $props()

  // Derived: a new filter value on every read would recompute the rows each
  // time. It changes with the decisions, so "To review" drops rows as they are decided.
  const columnFilters = $derived(
    view === 'all'
      ? []
      : [{ id: 'product', value: { view, decisions: meta.decisions } }],
  )

  const table = createSvelteTable({
    get data() {
      return rows
    },
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      get columnFilters() {
        return columnFilters
      },
    },
    autoResetPageIndex: false,
    get meta() {
      return meta
    },
  })

  // Stepping through products keeps the open one in view
  $effect(() => {
    if (openId) {
      document
        .querySelector(`[data-review-id="${openId}"]`)
        ?.scrollIntoView({ block: 'nearest' })
    }
  })

  function rowClass(row: CatalogRow) {
    const state = row.change ? rowState(row.change, meta.decisions) : null
    return cn(
      row.change && 'cursor-pointer',
      // Rows waiting for review stand out; everything else stays quiet
      (state === 'pending' || state === 'partial') &&
        'bg-amber-500/[0.07] shadow-[inset_3px_0_0_var(--color-amber-500)] hover:bg-amber-500/[0.12]',
      state === 'rejected' && 'text-muted-foreground',
    )
  }
</script>

<div class="max-h-[36rem] min-h-[28rem] min-w-0 flex-1 overflow-auto">
  <Table.Root>
    <Table.Header>
      {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
        <Table.Row class="hover:bg-transparent">
          {#each headerGroup.headers as header (header.id)}
            <Table.Head>
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
          data-state={row.id === openId ? 'selected' : undefined}
          class={rowClass(row.original)}
          onclick={row.original.change ? () => meta.open(row.id) : undefined}
        >
          {#each row.getVisibleCells() as cell (cell.id)}
            <Table.Cell class="py-2.5">
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
            {view === 'review'
              ? 'Everything has been reviewed.'
              : `No ${view} changes.`}
          </Table.Cell>
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
</div>
