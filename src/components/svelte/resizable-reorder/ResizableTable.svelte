<script lang="ts" generics="TData, TValue">
  import { onMount } from 'svelte'
  import { getCoreRowModel, type ColumnDef } from '@tanstack/table-core'
  import GripVertical from '@lucide/svelte/icons/grip-vertical'
  import { cn } from '$lib/utils.js'
  import {
    FlexRender,
    createSvelteTable,
  } from '$lib/components/ui/data-table/index.js'
  import * as Table from '$lib/components/ui/table/index.js'
  import { Button } from '$lib/components/ui/button/index.js'
  import { sortable } from './sortable'

  const STORAGE_KEY = 'resizable-table-layout'

  interface StoredLayout {
    columnOrder?: string[]
    columnSizing?: Record<string, number>
  }

  function loadLayout(): StoredLayout {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  }

  type Props = {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
  }

  let { columns, data }: Props = $props()

  const defaultOrder = () => columns.map((c) => c.id as string)

  // svelte-ignore state_referenced_locally
  let columnOrder = $state<string[]>(defaultOrder())
  let columnSizing = $state<Record<string, number>>({})
  let isHydrated = false

  // Restore the saved layout after mount, then persist every change
  onMount(() => {
    const saved = loadLayout()
    if (saved.columnOrder) columnOrder = saved.columnOrder
    if (saved.columnSizing) columnSizing = saved.columnSizing
    isHydrated = true
  })

  $effect(() => {
    const layout = JSON.stringify({ columnOrder, columnSizing })
    if (!isHydrated) return
    window.localStorage.setItem(STORAGE_KEY, layout)
  })

  const table = createSvelteTable({
    get data() {
      return data
    },
    get columns() {
      return columns
    },
    state: {
      get columnOrder() {
        return columnOrder
      },
      get columnSizing() {
        return columnSizing
      },
    },
    onColumnOrderChange: (updater) => {
      columnOrder =
        typeof updater === 'function' ? updater(columnOrder) : updater
    },
    onColumnSizingChange: (updater) => {
      columnSizing =
        typeof updater === 'function' ? updater(columnSizing) : updater
    },
    columnResizeMode: 'onChange',
    enableColumnResizing: true,
    getCoreRowModel: getCoreRowModel(),
  })

  function arrayMove<T>(list: T[], from: number, to: number) {
    const next = [...list]
    next.splice(to, 0, next.splice(from, 1)[0])
    return next
  }

  // SortableJS moves the header cell itself; the attachment puts it back and
  // TanStack's columnOrder state drives the new layout.
  function moveColumn(oldIndex: number, newIndex: number) {
    columnOrder = arrayMove(columnOrder, oldIndex, newIndex)
  }

  function resetLayout() {
    window.localStorage.removeItem(STORAGE_KEY)
    columnOrder = defaultOrder()
    columnSizing = {}
  }
</script>

<div>
  <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
    <p class="text-sm text-muted-foreground">
      Drag a header's grip to reorder, drag its right edge to resize.
    </p>
    <Button type="button" variant="outline" size="sm" onclick={resetLayout}>
      Reset layout
    </Button>
  </div>
  <div class="overflow-x-auto rounded-md border">
    <Table.Root style="width: {table.getTotalSize()}px">
      <Table.Header>
        {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
          <Table.Row
            {@attach sortable({ onMove: moveColumn, direction: 'horizontal' })}
          >
            {#each headerGroup.headers as header (header.id)}
              <Table.Head
                class="select-none"
                style="width: {header.getSize()}px; position: relative"
              >
                <div class="flex items-center gap-1.5 pr-2">
                  <button
                    type="button"
                    data-drag-handle
                    class="cursor-grab text-muted-foreground active:cursor-grabbing"
                    aria-label="Reorder column"
                  >
                    <GripVertical class="h-3.5 w-3.5" />
                  </button>
                  <span>
                    {#if !header.isPlaceholder}
                      <FlexRender
                        content={header.column.columnDef.header}
                        context={header.getContext()}
                      />
                    {/if}
                  </span>
                </div>
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div
                  class={cn(
                    'absolute top-0 right-0 h-full w-1 cursor-col-resize touch-none bg-border opacity-0 select-none hover:opacity-100',
                    header.column.getIsResizing() && 'bg-primary opacity-100',
                  )}
                  onmousedown={header.getResizeHandler()}
                  ontouchstart={header.getResizeHandler()}
                ></div>
              </Table.Head>
            {/each}
          </Table.Row>
        {/each}
      </Table.Header>
      <Table.Body>
        {#each table.getRowModel().rows as row (row.id)}
          <Table.Row>
            {#each row.getVisibleCells() as cell (cell.id)}
              <Table.Cell style="width: {cell.column.getSize()}px">
                <FlexRender
                  content={cell.column.columnDef.cell}
                  context={cell.getContext()}
                />
              </Table.Cell>
            {/each}
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
</div>
