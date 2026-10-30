<script lang="ts">
  import { getCoreRowModel, type ColumnDef } from '@tanstack/table-core'
  import {
    FlexRender,
    createSvelteTable,
    renderComponent,
  } from '$lib/components/ui/data-table/index.js'
  import * as Table from '$lib/components/ui/table/index.js'
  import * as Select from '$lib/components/ui/select/index.js'
  import BoldCell from './BoldCell.svelte'
  import type { AggregationType, PivotRow, SalesRecord } from './pivot'
  import { pivotData } from './pivot'

  const DIMENSIONS: { value: keyof SalesRecord; label: string }[] = [
    { value: 'region', label: 'Region' },
    { value: 'quarter', label: 'Quarter' },
    { value: 'channel', label: 'Channel' },
  ]

  const AGGREGATIONS: { value: AggregationType; label: string }[] = [
    { value: 'sum', label: 'Sum' },
    { value: 'avg', label: 'Average' },
    { value: 'count', label: 'Count' },
  ]

  function formatValue(value: number, aggFn: AggregationType) {
    if (aggFn === 'count') return value.toLocaleString('en-US')
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    })
  }

  let { data }: { data: SalesRecord[] } = $props()

  let rowDim = $state<keyof SalesRecord>('region')
  let colDim = $state<keyof SalesRecord>('quarter')
  let aggFn = $state<AggregationType>('sum')

  const pivot = $derived(pivotData(data, rowDim, colDim, aggFn))

  const labelOf = (dim: string) => DIMENSIONS.find((d) => d.value === dim)!.label
  const rowLabel = $derived(labelOf(rowDim))

  // Columns are derived from the pivot result, so they rebuild when the
  // dimensions or the aggregate change.
  const columns = $derived<ColumnDef<PivotRow>[]>([
    {
      id: 'rowValue',
      header: rowLabel,
      accessorKey: 'rowValue',
      cell: ({ getValue }) =>
        renderComponent(BoldCell, { text: getValue() as string }),
    },
    ...pivot.colValues.map(
      (colValue): ColumnDef<PivotRow> => ({
        id: colValue,
        header: colValue,
        accessorFn: (row) => row.cells[colValue],
        cell: ({ getValue }) => formatValue(getValue() as number, aggFn),
      }),
    ),
    {
      id: 'total',
      header: 'Total',
      accessorKey: 'total',
      cell: ({ getValue }) =>
        renderComponent(BoldCell, {
          text: formatValue(getValue() as number, aggFn),
        }),
    },
  ])

  const table = createSvelteTable({
    get data() {
      return pivot.rows
    },
    get columns() {
      return columns
    },
    getCoreRowModel: getCoreRowModel(),
  })
</script>

<div>
  <div class="mb-3 flex flex-wrap items-center gap-3">
    <div class="flex items-center gap-2">
      <span class="text-sm text-muted-foreground">Rows</span>
      <Select.Root
        type="single"
        value={rowDim}
        onValueChange={(v) => (rowDim = v as keyof SalesRecord)}
      >
        <Select.Trigger class="w-32">{labelOf(rowDim)}</Select.Trigger>
        <Select.Content>
          {#each DIMENSIONS.filter((d) => d.value !== colDim) as d (d.value)}
            <Select.Item value={d.value} label={d.label}>{d.label}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
    </div>
    <div class="flex items-center gap-2">
      <span class="text-sm text-muted-foreground">Columns</span>
      <Select.Root
        type="single"
        value={colDim}
        onValueChange={(v) => (colDim = v as keyof SalesRecord)}
      >
        <Select.Trigger class="w-32">{labelOf(colDim)}</Select.Trigger>
        <Select.Content>
          {#each DIMENSIONS.filter((d) => d.value !== rowDim) as d (d.value)}
            <Select.Item value={d.value} label={d.label}>{d.label}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
    </div>
    <div class="flex items-center gap-2">
      <span class="text-sm text-muted-foreground">Aggregate</span>
      <Select.Root
        type="single"
        value={aggFn}
        onValueChange={(v) => (aggFn = v as AggregationType)}
      >
        <Select.Trigger class="w-32">
          {AGGREGATIONS.find((a) => a.value === aggFn)?.label}
        </Select.Trigger>
        <Select.Content>
          {#each AGGREGATIONS as a (a.value)}
            <Select.Item value={a.value} label={a.label}>{a.label}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
    </div>
  </div>

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
          <Table.Row>
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
      <Table.Footer>
        <Table.Row>
          <Table.Cell>Total</Table.Cell>
          {#each pivot.colValues as colValue (colValue)}
            <Table.Cell>
              {formatValue(pivot.columnTotals[colValue], aggFn)}
            </Table.Cell>
          {/each}
          <Table.Cell>{formatValue(pivot.grandTotal, aggFn)}</Table.Cell>
        </Table.Row>
      </Table.Footer>
    </Table.Root>
  </div>
</div>
