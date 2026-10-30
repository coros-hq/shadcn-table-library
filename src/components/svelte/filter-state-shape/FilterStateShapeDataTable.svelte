<script lang="ts" generics="TData, TValue">
  import { format } from 'date-fns'
  import { CalendarDate, getLocalTimeZone } from '@internationalized/date'
  import type { DateValue } from '@internationalized/date'
  import CalendarIcon from '@lucide/svelte/icons/calendar'
  import {
    getCoreRowModel,
    getFilteredRowModel,
    type ColumnDef,
    type ColumnFiltersState,
  } from '@tanstack/table-core'
  import {
    FlexRender,
    createSvelteTable,
  } from '$lib/components/ui/data-table/index.js'
  import * as Table from '$lib/components/ui/table/index.js'
  import { Input } from '$lib/components/ui/input/index.js'
  import { Button } from '$lib/components/ui/button/index.js'
  import { RangeCalendar } from '$lib/components/ui/range-calendar/index.js'
  import * as Popover from '$lib/components/ui/popover/index.js'
  import MultiSelectFilter from '$lib/components/ui/multi-select-filter/MultiSelectFilter.svelte'
  import ActiveFilterChips from './ActiveFilterChips.svelte'
  import type { ActiveFilter } from './type'

  interface FilterOption {
    value: string
    label: string
  }

  type Props = {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    categoryOptions: FilterOption[]
  }

  let { columns, data, categoryOptions }: Props = $props()

  let globalFilter = $state('')
  let filters = $state<ActiveFilter[]>([])

  const categoryFilter = $derived(
    filters.find(
      (f): f is Extract<ActiveFilter, { type: 'multiSelect' }> =>
        f.type === 'multiSelect' && f.columnId === 'category',
    ),
  )
  const dueDateFilter = $derived(
    filters.find(
      (f): f is Extract<ActiveFilter, { type: 'dateRange' }> =>
        f.type === 'dateRange' && f.columnId === 'dueDate',
    ),
  )

  function setCategoryValues(values: string[]) {
    const rest = filters.filter((f) => f.columnId !== 'category')
    filters =
      values.length === 0
        ? rest
        : [...rest, { type: 'multiSelect', columnId: 'category', values }]
  }

  // The calendar speaks @internationalized/date; the filter state stores plain Dates
  const toCalendarDate = (date?: Date) =>
    date
      ? new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
      : undefined
  const toDate = (value?: DateValue) => value?.toDate(getLocalTimeZone())

  function setDueDateRange(range: { start?: DateValue; end?: DateValue }) {
    const from = toDate(range.start)
    const to = toDate(range.end)
    const rest = filters.filter((f) => f.columnId !== 'dueDate')
    filters =
      !from && !to
        ? rest
        : [...rest, { type: 'dateRange', columnId: 'dueDate', from, to }]
  }

  function removeFilter(columnId: string) {
    filters = filters.filter((f) => f.columnId !== columnId)
  }

  function clearAll() {
    filters = []
  }

  // `filters` is the single source of truth for structured filters — it
  // drives both the toolbar controls and the chips row. columnFilters is
  // derived from it rather than owned by the table.
  const columnFilters = $derived<ColumnFiltersState>(
    filters.map((f) =>
      f.type === 'multiSelect'
        ? { id: f.columnId, value: f.values }
        : { id: f.columnId, value: { from: f.from, to: f.to } },
    ),
  )

  const table = createSvelteTable({
    get data() {
      return data
    },
    get columns() {
      return columns
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: (updater) => {
      globalFilter =
        typeof updater === 'function' ? updater(globalFilter) : updater
    },
    state: {
      get columnFilters() {
        return columnFilters
      },
      get globalFilter() {
        return globalFilter
      },
    },
  })
</script>

<div>
  <div class="mb-3 flex flex-wrap items-center gap-2">
    <Input
      bind:value={globalFilter}
      placeholder="Search tasks..."
      class="w-full sm:w-64"
    />
    <MultiSelectFilter
      title="Category"
      options={categoryOptions}
      bind:selected={() => categoryFilter?.values ?? [], setCategoryValues}
    />
    <Popover.Root>
      <Popover.Trigger>
        {#snippet child({ props })}
          <Button {...props} variant="outline" size="sm">
            <CalendarIcon class="mr-2 h-4 w-4" />
            {#if dueDateFilter?.from}
              {format(dueDateFilter.from, 'MMM d')}
              {#if dueDateFilter.to}
                – {format(dueDateFilter.to, 'MMM d')}
              {/if}
            {:else}
              Due date
            {/if}
          </Button>
        {/snippet}
      </Popover.Trigger>
      <Popover.Content class="w-auto p-0" align="start">
        <RangeCalendar
          numberOfMonths={2}
          placeholder={toCalendarDate(dueDateFilter?.from)}
          bind:value={
            () => ({
              start: toCalendarDate(dueDateFilter?.from),
              end: toCalendarDate(dueDateFilter?.to),
            }),
            setDueDateRange
          }
        />
      </Popover.Content>
    </Popover.Root>
  </div>

  <div class="mb-3">
    <ActiveFilterChips {filters} onremove={removeFilter} onclearall={clearAll} />
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
