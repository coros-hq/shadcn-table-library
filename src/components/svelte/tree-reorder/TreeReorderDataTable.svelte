<script lang="ts" generics="TData extends { id: string; children?: TData[] }">
  import {
    getCoreRowModel,
    getExpandedRowModel,
    type ColumnDef,
    type ExpandedState,
  } from '@tanstack/table-core'
  import GripVertical from '@lucide/svelte/icons/grip-vertical'
  import {
    FlexRender,
    createSvelteTable,
  } from '$lib/components/ui/data-table/index.js'
  import * as Table from '$lib/components/ui/table/index.js'
  import { sortable } from './sortable'

  type TreeNode = { id: string; children?: TreeNode[] }

  function arrayMove<T>(list: T[], from: number, to: number) {
    const next = [...list]
    next.splice(to, 0, next.splice(from, 1)[0])
    return next
  }

  // Moves `activeId` to `overId`'s slot, but only when both are siblings under
  // the same parent — it walks the tree until it finds the level they share.
  function reorderSiblings<T extends TreeNode>(
    nodes: T[],
    activeId: string,
    overId: string,
  ): { nodes: T[]; moved: boolean } {
    const oldIndex = nodes.findIndex((n) => n.id === activeId)
    const newIndex = nodes.findIndex((n) => n.id === overId)

    if (oldIndex !== -1 && newIndex !== -1) {
      return { nodes: arrayMove(nodes, oldIndex, newIndex), moved: true }
    }

    let moved = false
    const next = nodes.map((node) => {
      if (!node.children) return node
      const result = reorderSiblings(node.children as T[], activeId, overId)
      if (result.moved) moved = true
      return result.moved ? { ...node, children: result.nodes } : node
    })

    return { nodes: moved ? next : nodes, moved }
  }

  type Props = {
    columns: ColumnDef<TData, any>[]
    // The parent owns the tree; a drop pushes the reordered tree back through bind:data
    data: TData[]
  }

  let { columns, data = $bindable() }: Props = $props()

  let expanded = $state<ExpandedState>(true)

  const table = createSvelteTable({
    get data() {
      return data
    },
    get columns() {
      return columns
    },
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getSubRows: (row) => row.children,
    getExpandedRowModel: getExpandedRowModel(),
    onExpandedChange: (updater) => {
      expanded = typeof updater === 'function' ? updater(expanded) : updater
    },
    state: {
      get expanded() {
        return expanded
      },
    },
  })

  // SortableJS moves the DOM node itself; the attachment puts it back, then we
  // reorder the tree by row id.
  function moveRow(oldIndex: number, newIndex: number) {
    const rows = table.getRowModel().rows
    const activeId = rows[oldIndex].id
    const overId = rows[newIndex].id
    if (activeId === overId) return
    const result = reorderSiblings(data, activeId, overId)
    if (result.moved) data = result.nodes
  }
</script>

<div class="overflow-hidden rounded-md border">
  <Table.Root>
    <Table.Header>
      {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
        <Table.Row>
          <Table.Head class="w-8" />
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
    <Table.Body {@attach sortable({ onMove: moveRow })}>
      {#each table.getRowModel().rows as row (row.id)}
        <Table.Row>
          <Table.Cell class="w-8">
            <button
              type="button"
              data-drag-handle
              class="cursor-grab text-muted-foreground active:cursor-grabbing"
              aria-label="Reorder row"
            >
              <GripVertical class="h-3.5 w-3.5" />
            </button>
          </Table.Cell>
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
          <Table.Cell colspan={columns.length + 1} class="h-24 text-center">
            No results.
          </Table.Cell>
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
</div>
