<script lang="ts">
  import { getCoreRowModel } from '@tanstack/table-core'
  import { cn } from '$lib/utils.js'
  import { FlexRender, createSvelteTable } from '$lib/components/ui/data-table/index.js'
  import { Skeleton } from '$lib/components/ui/skeleton/index.js'
  import * as Table from '$lib/components/ui/table/index.js'
  import { columns } from './columns'
  import type { Invoice } from './data'

  type Props = {
    data: Invoice[]
    /** First load: no data yet, so render placeholder rows */
    isLoading?: boolean
    /** Background refetch: keep the current rows and dim them */
    isFetching?: boolean
    skeletonRows?: number
  }

  let { data, isLoading = false, isFetching = false, skeletonRows = 5 }: Props = $props()

  // Varied widths so the placeholder rows read as content, not a grid of bars
  const SKELETON_WIDTHS = ['w-3/4', 'w-1/2', 'w-2/3', 'w-5/6', 'w-1/3']

  const table = createSvelteTable({
    get data() {
      return data
    },
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const leafColumns = $derived(table.getAllLeafColumns())
</script>

<div
  class="relative overflow-hidden rounded-md border"
  aria-busy={isLoading || isFetching}
>
  {#if isFetching && !isLoading}
    <div class="absolute inset-x-0 top-0 z-10 h-0.5 animate-pulse bg-primary"></div>
  {/if}
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
    <Table.Body class={cn(isFetching && 'opacity-60 transition-opacity')}>
      {#if isLoading}
        {#each { length: skeletonRows } as _, rowIndex (rowIndex)}
          <Table.Row class="hover:bg-transparent">
            {#each leafColumns as column, colIndex (column.id)}
              <Table.Cell>
                <Skeleton
                  class={cn(
                    'h-4',
                    SKELETON_WIDTHS[(rowIndex + colIndex) % SKELETON_WIDTHS.length],
                    column.id === 'amount' && 'ml-auto',
                  )}
                />
              </Table.Cell>
            {/each}
          </Table.Row>
        {/each}
      {:else}
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
      {/if}
    </Table.Body>
  </Table.Root>
</div>
