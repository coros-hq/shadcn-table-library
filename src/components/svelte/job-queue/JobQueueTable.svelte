<script lang="ts">
  import {
    getCoreRowModel,
    getExpandedRowModel,
    getFilteredRowModel,
  } from '@tanstack/table-core'
  import type { ExpandedState } from '@tanstack/table-core'
  import {
    FlexRender,
    createSvelteTable,
  } from '$lib/components/ui/data-table/index.js'
  import * as Table from '$lib/components/ui/table/index.js'
  import { cn } from '$lib/utils.js'
  import { columns } from './columns'
  import type { QueueMeta } from './columns'
  import type { Job } from './data'
  import JobErrors from './JobErrors.svelte'
  import { hasErrors } from './queue'
  import type { View } from './queue'

  let { jobs, view, meta }: { jobs: Job[]; view: View; meta: QueueMeta } =
    $props()

  let expanded = $state<ExpandedState>({})
  // Derived: a new filter array on every tick would refilter for nothing
  const columnFilters = $derived(
    view === 'all' ? [] : [{ id: 'status', value: view }],
  )

  const table = createSvelteTable({
    get data() {
      return jobs
    },
    columns,
    // Ids keep a row (and whether it's expanded) stable while jobs update
    getRowId: (job) => job.id,
    getRowCanExpand: (row) => hasErrors(row.original),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    state: {
      get expanded() {
        return expanded
      },
      get columnFilters() {
        return columnFilters
      },
    },
    onExpandedChange: (updater) => {
      expanded = typeof updater === 'function' ? updater(expanded) : updater
    },
    // The data changes several times a second; nothing should reset with it
    autoResetExpanded: false,
    autoResetPageIndex: false,
    get meta() {
      return meta
    },
  })
</script>

<div class="overflow-hidden rounded-md border">
  <Table.Root>
    <Table.Header>
      {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
        <Table.Row class="hover:bg-transparent">
          {#each headerGroup.headers as header (header.id)}
            <Table.Head class={cn(header.column.id === 'expand' && 'w-10')}>
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
          class={cn(
            row.original.status === 'failed' &&
              'bg-destructive/[0.03] hover:bg-destructive/[0.06]',
            row.getIsExpanded() && 'border-b-0',
          )}
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
        {#if row.getIsExpanded()}
          <Table.Row class="hover:bg-transparent">
            <Table.Cell
              colspan={columns.length}
              class="bg-muted/30 py-4 pr-4 pl-12 whitespace-normal"
            >
              <JobErrors job={row.original} />
            </Table.Cell>
          </Table.Row>
        {/if}
      {:else}
        <Table.Row class="hover:bg-transparent">
          <Table.Cell
            colspan={columns.length}
            class="h-24 text-center text-muted-foreground"
          >
            {view === 'failed' ? 'No failed jobs.' : `No ${view} jobs.`}
          </Table.Cell>
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
</div>
