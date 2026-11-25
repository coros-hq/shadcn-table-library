<script lang="ts" generics="TData extends RowData & { role: string }">
  import {
    FlexRender,
    createTable,
    type ColumnDef,
    type RowData,
  } from '@tanstack/svelte-table'
  import { v9Features, type V9Features } from '$lib/table-v9-features'
  import X from '@lucide/svelte/icons/x'
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
    columns: ColumnDef<V9Features, TData, any>[]
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

  const table = createTable({
    features: v9Features,
    get data() {
      return filteredData
    },
    get columns() {
      return columns
    },
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
