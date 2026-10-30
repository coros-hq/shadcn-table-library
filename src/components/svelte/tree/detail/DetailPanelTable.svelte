<script lang="ts">
  import {
    getCoreRowModel,
    getExpandedRowModel,
    type ColumnDef,
    type ExpandedState,
    type Row,
  } from '@tanstack/table-core'
  import {
    FlexRender,
    createSvelteTable,
  } from '$lib/components/ui/data-table/index.js'
  import * as Table from '$lib/components/ui/table/index.js'
  import { cn } from '$lib/utils.js'
  import ShipmentCard from './ShipmentCard.svelte'
  import type { Order, Shipment, TreeRow } from './data'

  type Props = {
    columns: ColumnDef<TreeRow, any>[]
    data: Order[]
  }

  let { columns, data }: Props = $props()

  // The card takes this room from the table; its header repeats these values
  const hiddenWhileOpen = { details: false, amount: false, date: false }

  let expanded = $state<ExpandedState>(true)
  // Kept after closing so the card keeps its content while it slides out
  let panel = $state.raw<{
    shipment: Shipment
    order: Order
    trigger: HTMLElement
    open: boolean
  } | null>(null)

  const table = createSvelteTable<TreeRow>({
    get data() {
      return data
    },
    get columns() {
      return columns
    },
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getSubRows: (row) => (row.kind === 'order' ? row.children : undefined),
    getExpandedRowModel: getExpandedRowModel(),
    onExpandedChange: (updater) => {
      expanded = typeof updater === 'function' ? updater(expanded) : updater
    },
    state: {
      get expanded() {
        return expanded
      },
      get columnVisibility() {
        return panel?.open ? hiddenWhileOpen : {}
      },
    },
  })

  function openShipment(row: Row<TreeRow>, event: Event) {
    const shipment = row.original
    const order = row.getParentRow()?.original
    if (shipment.kind !== 'shipment' || order?.kind !== 'order') return
    panel = {
      shipment,
      order,
      trigger: event.currentTarget as HTMLElement,
      open: true,
    }
  }

  function closePanel() {
    if (!panel) return
    panel = { ...panel, open: false }
    // The card is inert once closed, so hand focus back to the row that opened it
    panel.trigger.focus()
  }
</script>

<!-- The card is docked inside this box and pushes the table aside as it opens -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="relative flex min-h-[36rem] overflow-hidden rounded-md border"
  onkeydown={(e) => e.key === 'Escape' && panel?.open && closePanel()}
>
  <div class="min-w-0 flex-1 overflow-x-auto">
    <Table.Root>
      <Table.Header>
        {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
          <Table.Row>
            {#each headerGroup.headers as header (header.id)}
              <Table.Head style="width: {header.column.columnDef.size}px">
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
          {@const isShipment = row.original.kind === 'shipment'}
          <Table.Row
            tabindex={isShipment ? 0 : undefined}
            data-state={isShipment && panel?.open && panel.shipment.id === row.id
              ? 'selected'
              : undefined}
            class={cn(
              isShipment && 'cursor-pointer bg-muted/30 outline-none focus-visible:bg-muted',
            )}
            onclick={(e: MouseEvent) => isShipment && openShipment(row, e)}
            onkeydown={(e: KeyboardEvent) => {
              if (isShipment && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault()
                openShipment(row, e)
              }
            }}
          >
            {#each row.getVisibleCells() as cell (cell.id)}
              <Table.Cell>
                <FlexRender
                  content={cell.column.columnDef.cell}
                  context={cell.getContext()}
                />
              </Table.Cell>
            {/each}
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>

  <ShipmentCard
    open={panel?.open === true}
    shipment={panel?.shipment ?? null}
    order={panel?.order ?? null}
    onclose={closePanel}
  />
</div>
