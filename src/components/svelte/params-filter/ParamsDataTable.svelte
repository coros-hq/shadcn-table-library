<script lang="ts" generics="TData extends { role: string }, TValue">
  import { getCoreRowModel, type ColumnDef } from '@tanstack/table-core'
  import X from '@lucide/svelte/icons/x'
  import {
    FlexRender,
    createSvelteTable,
  } from '$lib/components/ui/data-table/index.js'
  import * as Table from '$lib/components/ui/table/index.js'
  import { Button } from '$lib/components/ui/button/index.js'
  import { Input } from '$lib/components/ui/input/index.js'
  import * as Select from '$lib/components/ui/select/index.js'

  /**
   * Filter state (search/role) is fully controlled by the caller through
   * bind: — this component doesn't know or care whether it's backed by the
   * URL, a router, a store, or a plain $state. See `useUrlFilters.svelte.ts`.
   */
  type Props = {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    roleOptions: string[]
    search: string
    role: string
  }

  let {
    columns,
    data,
    roleOptions,
    search = $bindable(),
    role = $bindable(),
  }: Props = $props()

  const filteredData = $derived(
    data.filter((row) => {
      const matchesSearch = search
        ? Object.values(row as Record<string, unknown>).some((value) =>
            String(value).toLowerCase().includes(search.toLowerCase()),
          )
        : true
      const matchesRole = role ? row.role === role : true
      return matchesSearch && matchesRole
    }),
  )

  const table = createSvelteTable({
    get data() {
      return filteredData
    },
    get columns() {
      return columns
    },
    getCoreRowModel: getCoreRowModel(),
  })

  const hasFilters = $derived(Boolean(search || role))

  function clearFilters() {
    search = ''
    role = ''
  }
</script>

<div>
  <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
    <Input
      bind:value={search}
      type="text"
      placeholder="Search..."
      class="w-full sm:w-64"
    />
    <div class="flex flex-wrap items-center gap-2">
      <Select.Root
        type="single"
        value={role || 'all'}
        onValueChange={(value) => (role = value === 'all' ? '' : String(value))}
      >
        <Select.Trigger class="w-40">
          {role || 'All roles'}
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="all" label="All roles">All roles</Select.Item>
          {#each roleOptions as option (option)}
            <Select.Item value={option} label={option}>{option}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
      {#if hasFilters}
        <Button variant="link" class="underline" onclick={clearFilters}>
          Clear Filters <X class="h-3 w-3" />
        </Button>
      {/if}
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
