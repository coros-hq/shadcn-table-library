<script setup lang="ts">
import { h, onBeforeUnmount, ref } from 'vue'
import {
  FlexRender,
  getCoreRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import type { ColumnDef } from '@tanstack/vue-table'
import { Undo2 } from '@lucide/vue'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
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

// The parent owns the rows; edits are pushed back through v-model
const data = defineModel<Product[]>('data', { required: true })

const editingCell = ref<{ rowId: string; columnId: string } | null>(null)
const draftValue = ref('')
const errors = ref<Record<string, string>>({})
const pendingCells = ref<Set<string>>(new Set())
const history = ref<HistoryEntry[]>([])
const errorTimers: Record<string, ReturnType<typeof setTimeout>> = {}

onBeforeUnmount(() => Object.values(errorTimers).forEach(clearTimeout))

function setCell(rowId: string, columnId: string, value: string | number) {
  data.value = data.value.map((r) =>
    r.id === rowId ? { ...r, [columnId]: value } : r,
  )
}

function startEdit(rowId: string, columnId: string, currentValue: string | number) {
  editingCell.value = { rowId, columnId }
  draftValue.value = String(currentValue)
}

function cancelEdit() {
  editingCell.value = null
}

function flashError(key: string, message: string) {
  errors.value = { ...errors.value, [key]: message }
  clearTimeout(errorTimers[key])
  errorTimers[key] = setTimeout(() => {
    const { [key]: _removed, ...rest } = errors.value
    errors.value = rest
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
  pendingCells.value = new Set(pendingCells.value).add(key)
  setTimeout(() => {
    const failed = Math.random() < 0.15
    const next = new Set(pendingCells.value)
    next.delete(key)
    pendingCells.value = next
    if (failed) {
      setCell(rowId, columnId, previousValue)
      const fromEnd = [...history.value]
        .reverse()
        .findIndex((h) => h.rowId === rowId && h.columnId === columnId)
      if (fromEnd !== -1) {
        const index = history.value.length - 1 - fromEnd
        history.value = history.value.filter((_, i) => i !== index)
      }
      flashError(key, 'Save failed — reverted')
    }
  }, 600)
}

function commitEdit(field: FieldConfig) {
  if (!editingCell.value) return
  const { rowId, columnId } = editingCell.value
  const key = cellKey(rowId, columnId)
  const error = field.validate(draftValue.value)

  if (error) {
    flashError(key, error)
    editingCell.value = null
    return
  }

  const parsedValue =
    field.type === 'number' ? Number(draftValue.value) : draftValue.value
  const row = data.value.find((r) => r.id === rowId)
  editingCell.value = null
  if (!row) return

  const previousValue = row[columnId as keyof Product] as string | number
  if (previousValue === parsedValue) return

  setCell(rowId, columnId, parsedValue)
  history.value = [...history.value, { rowId, columnId, previousValue }]
  saveOptimistically(rowId, columnId, previousValue, key)
}

function undo() {
  const last = history.value[history.value.length - 1]
  if (!last) return
  setCell(last.rowId, last.columnId, last.previousValue)
  history.value = history.value.slice(0, -1)
}

// Cell renderers read the refs above while rendering, so Vue re-renders just
// the affected cells — no need to rebuild `columns` on every keystroke.
const editable: ColumnDef<Product>[] = editableFields.map((field) => ({
  id: field.id,
  header: field.label,
  accessorKey: field.id,
  cell: ({ row, getValue }) => {
    const key = cellKey(row.original.id, field.id)
    const isEditing =
      editingCell.value?.rowId === row.original.id &&
      editingCell.value.columnId === field.id
    const isPending = pendingCells.value.has(key)
    const error = errors.value[key]
    const value = getValue() as string | number

    if (isEditing) {
      return h(Input, {
        modelValue: draftValue.value,
        'onUpdate:modelValue': (next: string | number) =>
          (draftValue.value = String(next)),
        type: field.type === 'number' ? 'number' : 'text',
        class: 'h-7 px-2',
        onBlur: () => commitEdit(field),
        onKeydown: (e: KeyboardEvent) => {
          if (e.key === 'Enter') commitEdit(field)
          if (e.key === 'Escape') cancelEdit()
        },
        // autofocus on mount
        onVnodeMounted: (vnode) => (vnode.el as HTMLElement).focus(),
      })
    }

    return h(
      'button',
      {
        type: 'button',
        onClick: () => startEdit(row.original.id, field.id, value),
        class: cn(
          'w-full rounded px-1.5 py-1 text-left hover:bg-muted',
          isPending && 'opacity-50',
          error && 'text-destructive',
        ),
      },
      error ?? (field.id === 'price' ? currency(value as number) : String(value)),
    )
  },
}))

const columns: ColumnDef<Product>[] = [
  { accessorKey: 'id', header: 'SKU' },
  ...editable,
  { accessorKey: 'category', header: 'Category' },
]

const table = useVueTable({
  get data() {
    return data.value
  },
  columns,
  getCoreRowModel: getCoreRowModel(),
})
</script>

<template>
  <div>
    <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
      <p class="text-sm text-muted-foreground">
        Click a Name, Price, or Stock cell to edit it.
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        :disabled="history.length === 0"
        @click="undo"
      >
        <Undo2 class="h-3.5 w-3.5" />
        Undo{{ history.length > 0 ? ` (${history.length})` : '' }}
      </Button>
    </div>
    <div class="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
          >
            <TableHead v-for="header in headerGroup.headers" :key="header.id">
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="row in table.getRowModel().rows" :key="row.id">
            <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
              <FlexRender
                :render="cell.column.columnDef.cell"
                :props="cell.getContext()"
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
