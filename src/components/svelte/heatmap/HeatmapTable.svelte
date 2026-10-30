<script lang="ts">
  import { getCoreRowModel, type ColumnDef } from '@tanstack/table-core'
  import {
    FlexRender,
    createSvelteTable,
    renderComponent,
  } from '$lib/components/ui/data-table/index.js'
  import * as Table from '$lib/components/ui/table/index.js'
  import HeatCell from './HeatCell.svelte'
  import RowLabel from './RowLabel.svelte'
  import type { HeatmapRow } from './heatmap'
  import { getHeatColor, getHeatmapRange } from './heatmap'

  type Props = {
    columns: string[]
    data: HeatmapRow[]
    formatValue?: (value: number) => string
  }

  let { columns, data, formatValue = (value) => String(value) }: Props = $props()

  const range = $derived(getHeatmapRange(data, columns))

  const tableColumns = $derived<ColumnDef<HeatmapRow>[]>([
    {
      id: 'label',
      header: '',
      accessorKey: 'label',
      cell: ({ getValue }) =>
        renderComponent(RowLabel, { label: getValue() as string }),
    },
    ...columns.map(
      (col): ColumnDef<HeatmapRow> => ({
        id: col,
        header: col,
        accessorFn: (row) => row.values[col],
        cell: ({ getValue }) => {
          const value = getValue() as number
          const { backgroundColor, isDark } = getHeatColor(
            value,
            range.min,
            range.max,
          )
          return renderComponent(HeatCell, {
            text: formatValue(value),
            backgroundColor,
            isDark,
          })
        },
      }),
    ),
  ])

  const table = createSvelteTable({
    get data() {
      return data
    },
    get columns() {
      return tableColumns
    },
    getCoreRowModel: getCoreRowModel(),
  })

  const legend = $derived({
    low: getHeatColor(range.min, range.min, range.max).backgroundColor,
    high: getHeatColor(range.max, range.min, range.max).backgroundColor,
  })
</script>

<div>
  <div class="overflow-hidden rounded-md border">
    <Table.Root>
      <Table.Header>
        {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
          <Table.Row>
            {#each headerGroup.headers as header (header.id)}
              <Table.Head class="text-center">
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
              <Table.Cell
                class={cell.column.id === 'label' ? undefined : 'p-0 text-center'}
              >
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
  <div class="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
    <span>{formatValue(range.min)}</span>
    <div
      class="h-2 flex-1 rounded-full"
      style:background="linear-gradient(to right, {legend.low}, {legend.high})"
    ></div>
    <span>{formatValue(range.max)}</span>
  </div>
</div>
