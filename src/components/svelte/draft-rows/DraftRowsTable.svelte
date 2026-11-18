<script lang="ts">
  import type { Snippet } from 'svelte'
  import { getCoreRowModel } from '@tanstack/table-core'
  import {
    FlexRender,
    createSvelteTable,
  } from '$lib/components/ui/data-table/index.js'
  import * as Table from '$lib/components/ui/table/index.js'
  import { cn } from '$lib/utils.js'
  import { columns } from './columns'
  import type { DraftMeta, Row } from './types'

  let {
    rows,
    meta,
    fresh,
    footer,
  }: {
    rows: Row[]
    meta: DraftMeta
    /** Ids of rows that were just saved, highlighted for a moment */
    fresh: Set<string>
    /** The "Add row" line under the last row */
    footer: Snippet
  } = $props()

  const table = createSvelteTable({
    get data() {
      return rows
    },
    columns,
    // Stable ids keep each input, and the focus in it, across keystrokes
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    get meta() {
      return meta
    },
  })
</script>

<div class="overflow-hidden rounded-md border">
  <Table.Root class="min-w-[640px]">
    <Table.Header>
      {#each table.getHeaderGroups() as group (group.id)}
        <Table.Row class="hover:bg-transparent">
          {#each group.headers as header (header.id)}
            <Table.Head
              class={cn(
                (header.column.id === 'amount' ||
                  header.column.id === 'actions') &&
                  'w-32',
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
        {@const draft = row.original.kind === 'draft'}
        <Table.Row
          data-kind={row.original.kind}
          class={cn(
            'transition-colors duration-1000',
            draft &&
              'bg-blue-50/60 hover:bg-blue-50/60 dark:bg-blue-500/5 dark:hover:bg-blue-500/5',
            fresh.has(row.id) && 'bg-emerald-50 dark:bg-emerald-500/10',
          )}
        >
          {#each row.getVisibleCells() as cell, i (cell.id)}
            <Table.Cell
              class={cn(
                draft ? 'py-1.5 align-top' : 'h-11',
                // A blue edge marks the rows that aren't saved yet
                draft && i === 0 && 'shadow-[inset_3px_0_0_var(--color-blue-500)]',
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
      <Table.Row class="hover:bg-transparent">
        <Table.Cell colspan={columns.length} class="p-1.5">
          {@render footer()}
        </Table.Cell>
      </Table.Row>
    </Table.Footer>
  </Table.Root>
</div>
