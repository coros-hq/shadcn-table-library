<script lang="ts">
  import { onDestroy } from 'svelte'
  import { getCoreRowModel, type ColumnDef } from '@tanstack/table-core'
  import Undo2 from '@lucide/svelte/icons/undo-2'
  import {
    FlexRender,
    createSvelteTable,
    renderComponent,
  } from '$lib/components/ui/data-table/index.js'
  import * as Table from '$lib/components/ui/table/index.js'
  import { Button } from '$lib/components/ui/button/index.js'
  import EditableCell from './EditableCell.svelte'
  import type { FieldConfig, Product } from './columns'
  import { editableFields } from './columns'

  interface HistoryEntry {
    rowId: string
    columnId: string
    previousValue: string | number
  }

  const currency = (value: number) =>
    value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  function cellKey(rowId: string, columnId: string) {
    return `${rowId}:${columnId}`
  }

  // The parent owns the rows; edits are pushed back through bind:data
  let { data = $bindable() }: { data: Product[] } = $props()

  let editingCell = $state<{ rowId: string; columnId: string } | null>(null)
  let draftValue = $state('')
  let errors = $state<Record<string, string>>({})
  let pendingCells = $state<Set<string>>(new Set())
  let history = $state<HistoryEntry[]>([])
  const errorTimers: Record<string, ReturnType<typeof setTimeout>> = {}

  onDestroy(() => Object.values(errorTimers).forEach(clearTimeout))

  function setCell(rowId: string, columnId: string, value: string | number) {
    data = data.map((r) => (r.id === rowId ? { ...r, [columnId]: value } : r))
  }

  function startEdit(rowId: string, columnId: string, currentValue: string | number) {
    editingCell = { rowId, columnId }
    draftValue = String(currentValue)
  }

  function cancelEdit() {
    editingCell = null
  }

  function flashError(key: string, message: string) {
    errors = { ...errors, [key]: message }
    clearTimeout(errorTimers[key])
    errorTimers[key] = setTimeout(() => {
      const { [key]: _removed, ...rest } = errors
      errors = rest
    }, 2000)
  }

  // Optimistic save: the edit is already applied; a simulated request resolves
  // 600ms later and, if it "fails", rolls the cell back.
  function saveOptimistically(
    rowId: string,
    columnId: string,
    previousValue: string | number,
    key: string,
  ) {
    pendingCells = new Set(pendingCells).add(key)
    setTimeout(() => {
      const failed = Math.random() < 0.15
      const next = new Set(pendingCells)
      next.delete(key)
      pendingCells = next
      if (failed) {
        setCell(rowId, columnId, previousValue)
        const fromEnd = [...history]
          .reverse()
          .findIndex((h) => h.rowId === rowId && h.columnId === columnId)
        if (fromEnd !== -1) {
          const index = history.length - 1 - fromEnd
          history = history.filter((_, i) => i !== index)
        }
        flashError(key, 'Save failed — reverted')
      }
    }, 600)
  }

  function commitEdit(field: FieldConfig) {
    if (!editingCell) return
    const { rowId, columnId } = editingCell
    const key = cellKey(rowId, columnId)
    const error = field.validate(draftValue)

    if (error) {
      flashError(key, error)
      editingCell = null
      return
    }

    const parsedValue = field.type === 'number' ? Number(draftValue) : draftValue
    const row = data.find((r) => r.id === rowId)
    editingCell = null
    if (!row) return

    const previousValue = row[columnId as keyof Product] as string | number
    if (previousValue === parsedValue) return

    setCell(rowId, columnId, parsedValue)
    history = [...history, { rowId, columnId, previousValue }]
    saveOptimistically(rowId, columnId, previousValue, key)
  }

  function undo() {
    const last = history[history.length - 1]
    if (!last) return
    setCell(last.rowId, last.columnId, last.previousValue)
    history = history.slice(0, -1)
  }

  // Cell renderers read the state above while rendering, so Svelte re-renders
  // just the affected cells — no need to rebuild `columns` on every keystroke.
  const editable: ColumnDef<Product>[] = editableFields.map((field) => ({
    id: field.id,
    header: field.label,
    accessorKey: field.id,
    cell: ({ row, getValue }) => {
      const key = cellKey(row.original.id, field.id)
      const value = getValue() as string | number

      return renderComponent(EditableCell, {
        display: field.id === 'price' ? currency(value as number) : String(value),
        type: field.type === 'number' ? 'number' : 'text',
        isEditing:
          editingCell?.rowId === row.original.id &&
          editingCell.columnId === field.id,
        isPending: pendingCells.has(key),
        error: errors[key],
        draft: draftValue,
        onstart: () => startEdit(row.original.id, field.id, value),
        ondraft: (next) => (draftValue = next),
        oncommit: () => commitEdit(field),
        oncancel: cancelEdit,
      })
    },
  }))

  const columns: ColumnDef<Product>[] = [
    { accessorKey: 'id', header: 'SKU' },
    ...editable,
    { accessorKey: 'category', header: 'Category' },
  ]

  const table = createSvelteTable({
    get data() {
      return data
    },
    columns,
    getCoreRowModel: getCoreRowModel(),
  })
</script>

<div>
  <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
    <p class="text-sm text-muted-foreground">
      Click a Name, Price, or Stock cell to edit it.
    </p>
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={history.length === 0}
      onclick={undo}
    >
      <Undo2 class="h-3.5 w-3.5" />
      Undo{history.length > 0 ? ` (${history.length})` : ''}
    </Button>
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
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
</div>
