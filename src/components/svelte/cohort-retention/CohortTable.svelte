<script lang="ts">
  import { getCoreRowModel } from '@tanstack/table-core'
  import {
    FlexRender,
    createSvelteTable,
  } from '$lib/components/ui/data-table/index.js'
  import * as Table from '$lib/components/ui/table/index.js'
  import { cn } from '$lib/utils.js'
  import { columns } from './columns'
  import { cohorts } from './data'
  import { hue } from './styles'
  import type { CohortMeta } from './styles'

  let { meta }: { meta: CohortMeta } = $props()

  const table = createSvelteTable({
    data: cohorts,
    columns,
    getRowId: (cohort) => cohort.id,
    getCoreRowModel: getCoreRowModel(),
    get meta() {
      return meta
    },
  })

  const isMonth = (id: string) => /^m\d+$/.test(id)
  // The cohort column stays put while the months scroll on small screens
  const sticky = 'sticky left-0 z-10 bg-background'
</script>

<div class={cn('overflow-hidden rounded-md border', hue)}>
  <Table.Root class="min-w-[860px]">
    <Table.Header>
      {#each table.getHeaderGroups() as group (group.id)}
        <Table.Row class="hover:bg-transparent">
          {#each group.headers as header (header.id)}
            <Table.Head
              colspan={header.colSpan}
              class={cn(
                'h-8',
                header.column.id === 'cohort' && sticky,
                isMonth(header.column.id) && 'w-14 px-0.5',
                header.column.id === 'months' && 'border-b',
              )}
            >
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
        <Table.Row
          aria-current={meta.highlighted === row.id ? 'true' : undefined}
          class={cn(
            'border-0 transition-opacity hover:bg-transparent motion-reduce:transition-none',
            meta.highlighted !== null &&
              meta.highlighted !== row.id &&
              'opacity-35',
            meta.highlighted === row.id &&
              'shadow-[inset_3px_0_0_var(--color-primary)]',
          )}
        >
          {#each row.getVisibleCells() as cell (cell.id)}
            <Table.Cell
              class={cn(
                'py-0.5',
                cell.column.id === 'cohort' && sticky,
                isMonth(cell.column.id) && 'px-0.5',
              )}
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
    <Table.Footer class="bg-transparent">
      {#each table.getFooterGroups().slice(0, 1) as group (group.id)}
        <Table.Row class="hover:bg-transparent">
          {#each group.headers as header (header.id)}
            <Table.Cell
              class={cn(
                'py-1.5',
                header.column.id === 'cohort' && sticky,
                isMonth(header.column.id) && 'px-0.5',
              )}
            >
              {#if !header.isPlaceholder}
                <FlexRender
                  content={header.column.columnDef.footer}
                  context={header.getContext()}
                />
              {/if}
            </Table.Cell>
          {/each}
        </Table.Row>
      {/each}
    </Table.Footer>
  </Table.Root>
</div>
