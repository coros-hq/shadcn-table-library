<script lang="ts">
  import {
    FlexRender,
    createTable,
    renderComponent,
    renderSnippet,
    type ColumnDef,
  } from '@tanstack/svelte-table'
  import { v9Features, type V9Features } from '$lib/table-v9-features'
  import { createRawSnippet } from 'svelte'
  import * as Table from '$lib/components/ui/table/index.js'
  import { Button } from '$lib/components/ui/button/index.js'
  import ArrowsClockwiseIcon from '$lib/components/ui/icons/ArrowsClockwiseIcon.svelte'
  import { cn } from '$lib/utils.js'
  import NameCell from './NameCell.svelte'
  import RowActions from './RowActions.svelte'
  import type { TeamMember } from './columns'

  type Props = {
    // The parent owns the rows; this component pushes changes back through bind:data
    data: TeamMember[]
    onreset?: () => void
  }

  let { data = $bindable(), onreset }: Props = $props()

  let refreshIcon: ArrowsClockwiseIcon | undefined

  function toggle(id: string, key: 'favorite' | 'notify' | 'archived') {
    data = data.map((row) => (row.id === id ? { ...row, [key]: !row[key] } : row))
  }

  function remove(id: string) {
    data = data.filter((row) => row.id !== id)
  }

  function handleReset() {
    refreshIcon?.startAnimation()
    onreset?.()
  }

  const columns: ColumnDef<V9Features, TeamMember>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) =>
        renderComponent(NameCell, {
          name: row.original.name,
          archived: row.original.archived,
        }),
    },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'role', header: 'Role' },
    {
      id: 'actions',
      header: () =>
        renderSnippet(
          createRawSnippet(() => ({
            render: () => `<span class="sr-only">Actions</span>`,
          })),
        ),
      cell: ({ row }) =>
        renderComponent(RowActions, {
          member: row.original,
          ontoggle: (key) => toggle(row.original.id, key),
          onremove: () => remove(row.original.id),
        }),
    },
  ]

  const table = createTable({
    features: v9Features,
    get data() {
      return data
    },
    columns,
  })
</script>

<div>
  <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
    <p class="text-sm text-muted-foreground">
      Hover a row action to preview its motion; click to apply it.
    </p>
    <Button type="button" variant="outline" size="sm" onclick={handleReset}>
      <ArrowsClockwiseIcon bind:this={refreshIcon} size={16} />
      Reset
    </Button>
  </div>
  <div class="overflow-hidden rounded-md border">
    <Table.Root>
      <Table.Header>
        {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
          <Table.Row>
            {#each headerGroup.headers as header (header.id)}
              <Table.Head class={header.id === 'actions' ? 'text-right' : undefined}>
                {#if !header.isPlaceholder}
                  <FlexRender {header} />
                {/if}
              </Table.Head>
            {/each}
          </Table.Row>
        {/each}
      </Table.Header>
      <Table.Body>
        {#each table.getRowModel().rows as row (row.id)}
          <Table.Row class={cn(row.original.archived && 'bg-muted/40')}>
            {#each row.getVisibleCells() as cell (cell.id)}
              <Table.Cell>
                <FlexRender {cell} />
              </Table.Cell>
            {/each}
          </Table.Row>
        {:else}
          <Table.Row>
            <Table.Cell colspan={columns.length} class="h-24 text-center">
              No team members. Click Reset to restore the demo data.
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
</div>
