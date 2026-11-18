<script lang="ts">
  import { tick } from 'svelte'
  import {
    getCoreRowModel,
    getExpandedRowModel,
    getSortedRowModel,
  } from '@tanstack/table-core'
  import type { ExpandedState, SortingState } from '@tanstack/table-core'
  import {
    FlexRender,
    createSvelteTable,
  } from '$lib/components/ui/data-table/index.js'
  import * as Table from '$lib/components/ui/table/index.js'
  import { cn } from '$lib/utils.js'
  import { columns } from './columns'
  import type { Metric } from './data'
  import MetricDetails from './MetricDetails.svelte'
  import type { AnomalyMeta } from './styles'

  let { metrics, meta }: { metrics: Metric[]; meta: AnomalyMeta } = $props()

  let sorting = $state.raw<SortingState>([{ id: 'change', desc: true }])
  let expanded = $state.raw<ExpandedState>({})
  let frame = $state<HTMLElement>()

  // Secondary columns step aside on small screens
  const responsive: Record<string, string> = {
    range: 'hidden md:table-cell',
    change: 'hidden sm:table-cell',
    kind: 'hidden sm:table-cell',
    // The two button columns give up their inner padding on phones
    expand: 'pr-0 sm:pr-2',
    review: 'pl-0 sm:pl-2',
  }

  /**
   * When reviewed rows are hidden, the row leaves under the pointer: move
   * focus to the next row's review button (or its expand button if it's in
   * range) instead of letting it vanish.
   */
  async function toggleReviewed(id: string) {
    const ids = table.getRowModel().rows.map((r) => r.original.id)
    const i = ids.indexOf(id)
    const next = ids.at(i + 1) ?? ids.at(i - 1)
    meta.toggleReviewed(id)
    await tick()
    if (!next || frame?.contains(document.activeElement)) return
    const row = frame?.querySelector(`[data-metric="${next}"]`)
    ;(
      row?.querySelector<HTMLElement>('[aria-pressed]') ??
      row?.querySelector<HTMLElement>('button')
    )?.focus()
  }

  const table = createSvelteTable({
    get data() {
      return metrics
    },
    columns,
    getRowId: (m) => m.id,
    // Every metric has a history to show
    getRowCanExpand: () => true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    state: {
      get sorting() {
        return sorting
      },
      get expanded() {
        return expanded
      },
    },
    onSortingChange: (u) => {
      sorting = typeof u === 'function' ? u(sorting) : u
    },
    onExpandedChange: (u) => {
      expanded = typeof u === 'function' ? u(expanded) : u
    },
    get meta(): AnomalyMeta {
      return { ...meta, toggleReviewed }
    },
  })
</script>

<div bind:this={frame} class="overflow-hidden rounded-md border">
  <Table.Root>
    <Table.Header>
      {#each table.getHeaderGroups() as group (group.id)}
        <Table.Row class="hover:bg-transparent">
          {#each group.headers as header (header.id)}
            <Table.Head
              class={cn(
                responsive[header.column.id],
                header.column.id === 'expand' && 'w-10',
              )}
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
          data-metric={row.original.id}
          class={cn(
            row.getIsExpanded() && 'border-b-0',
            meta.reviewed.has(row.original.id) && 'text-muted-foreground',
          )}
        >
          {#each row.getVisibleCells() as cell (cell.id)}
            <Table.Cell class={responsive[cell.column.id]}>
              <FlexRender
                content={cell.column.columnDef.cell}
                context={cell.getContext()}
              />
            </Table.Cell>
          {/each}
        </Table.Row>
        {#if row.getIsExpanded()}
          <Table.Row class="bg-muted/30 hover:bg-muted/30">
            <Table.Cell />
            <Table.Cell colspan={columns.length - 1} class="py-4">
              <MetricDetails metric={row.original} />
            </Table.Cell>
          </Table.Row>
        {/if}
      {:else}
        <Table.Row class="hover:bg-transparent">
          <Table.Cell
            colspan={columns.length}
            class="h-32 text-center text-muted-foreground"
          >
            Nothing to investigate here.
          </Table.Cell>
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
</div>
