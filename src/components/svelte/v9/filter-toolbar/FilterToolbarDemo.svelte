<script lang="ts">
  import { format } from 'date-fns'
  import {
    FlexRender,
    createTable,
    type ColumnDef,
  } from '@tanstack/svelte-table'
  import { filterToolbarFeatures, type FilterToolbarFeatures } from './types'
  import * as Table from '$lib/components/ui/table/index.js'
  import FilterToolbar from './FilterToolbar.svelte'
  import ActiveFilterChips from './ActiveFilterChips.svelte'
  import { conditionFilterFn } from './filter-fns'
  

  type Task = {
    id: string
    title: string
    category: string
    dueDate: Date
  }

  const data = $state<Task[]>([
    { id: 'tsk-1', title: 'Redesign onboarding flow', category: 'Design', dueDate: new Date('2026-08-05') },
    { id: 'tsk-2', title: 'Fix pagination bug on export', category: 'Engineering', dueDate: new Date('2026-08-08') },
    { id: 'tsk-3', title: 'Write Q3 newsletter draft', category: 'Marketing', dueDate: new Date('2026-07-28') },
    { id: 'tsk-4', title: 'Audit component color tokens', category: 'Design', dueDate: new Date('2026-08-15') },
    { id: 'tsk-5', title: 'Migrate auth to new session store', category: 'Engineering', dueDate: new Date('2026-08-20') },
  ])

  // Three variants, config-driven — no per-column filter wiring beyond `meta`.
  // Every filterable column shares the same generic `conditionFilterFn`; the
  // operator on the active condition (not the column) decides the comparison.
  const columns: ColumnDef<FilterToolbarFeatures, Task>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      filterFn: conditionFilterFn,
      meta: {
        label: 'Title',
        filterVariant: 'text',
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      filterFn: conditionFilterFn,
      meta: {
        label: 'Category',
        filterVariant: 'multiSelect',
        filterOptions: [
          { label: 'Design', value: 'Design' },
          { label: 'Engineering', value: 'Engineering' },
          { label: 'Marketing', value: 'Marketing' },
        ],
      },
    },
    {
      accessorKey: 'dueDate',
      header: 'Due date',
      filterFn: conditionFilterFn,
      cell: ({ getValue }) => format(getValue<Date>(), 'MMM d, yyyy'),
      meta: {
        label: 'Due date',
        filterVariant: 'dateRange',
      },
    },
  ]

  const table = createTable({
    features: filterToolbarFeatures,
    data,
    columns,
  })
</script>

<div>
  <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
    <FilterToolbar {table} />
  </div>

  <div class="mb-3">
    <ActiveFilterChips {table} />
  </div>

  <div class="overflow-hidden rounded-md border">
    <Table.Root>
      <Table.Header>
        {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
          <Table.Row>
            {#each headerGroup.headers as header (header.id)}
              <Table.Head>
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
          <Table.Row>
            {#each row.getVisibleCells() as cell (cell.id)}
              <Table.Cell>
                <FlexRender {cell} />
              </Table.Cell>
            {/each}
          </Table.Row>
        {:else}
          <Table.Row>
            <Table.Cell colspan={columns.length} class="h-24 text-center">
              No results.
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
</div>
