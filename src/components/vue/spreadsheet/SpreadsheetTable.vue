<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch, nextTick } from 'vue'
import {
  FlexRender,
  getCoreRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { columns } from './columns'
import { COLS, ROW_COUNT, evaluateSheet } from './formula'
import type { SheetRow } from './columns'

type Pos = { r: number; c: number }

const COL_IDS: readonly string[] = COLS
const COL_COUNT = COLS.length
const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n))
const cellName = (p: Pos) => `${COLS[p.c]}${p.r + 1}`

const props = defineProps<{ initialData: string[][] }>()

const raw = ref<string[][]>(props.initialData)
const active = ref<Pos>({ r: 0, c: 0 })
const anchor = ref<Pos>({ r: 0, c: 0 })
const editing = ref<string | null>(null)
let dragging = false
const gridRef = ref<HTMLDivElement | null>(null)

const computedSheet = computed(() => evaluateSheet(raw.value))
const rows = computed<SheetRow[]>(() =>
  computedSheet.value.map((cells, r) => ({ n: r + 1, cells })),
)

const table = useVueTable({
  get data() {
    return rows.value
  },
  columns,
  getCoreRowModel: getCoreRowModel(),
})

const range = computed(() => ({
  r1: Math.min(anchor.value.r, active.value.r),
  r2: Math.max(anchor.value.r, active.value.r),
  c1: Math.min(anchor.value.c, active.value.c),
  c2: Math.max(anchor.value.c, active.value.c),
}))
const inRange = (r: number, c: number) =>
  r >= range.value.r1 &&
  r <= range.value.r2 &&
  c >= range.value.c1 &&
  c <= range.value.c2

const stopDragging = () => {
  dragging = false
}
onMounted(() => window.addEventListener('mouseup', stopDragging))
onBeforeUnmount(() => window.removeEventListener('mouseup', stopDragging))

watch(active, async () => {
  await nextTick()
  gridRef.value
    ?.querySelector('[data-active="true"]')
    ?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
})

function select(pos: Pos, extend = false) {
  active.value = pos
  if (!extend) anchor.value = pos
}

function moveBy(dr: number, dc: number, extend = false) {
  select(
    {
      r: clamp(active.value.r + dr, 0, ROW_COUNT - 1),
      c: clamp(active.value.c + dc, 0, COL_COUNT - 1),
    },
    extend,
  )
}

function writeCells(updates: Array<[Pos, string]>) {
  const next = raw.value.map((row) => [...row])
  for (const [pos, value] of updates) next[pos.r][pos.c] = value
  raw.value = next
}

// Idempotent: a blur fired while the input unmounts finds nothing to commit
function commit(move?: Pos, refocus = true) {
  const draft = editing.value
  if (draft === null) return
  writeCells([[active.value, draft]])
  editing.value = null
  if (move) moveBy(move.r, move.c)
  if (refocus) gridRef.value?.focus()
}

function cancelEdit() {
  editing.value = null
  gridRef.value?.focus()
}

function startEdit(initial?: string) {
  editing.value = initial ?? raw.value[active.value.r][active.value.c]
}

function clearRange() {
  const { r1, r2, c1, c2 } = range.value
  const updates: Array<[Pos, string]> = []
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) updates.push([{ r, c }, ''])
  }
  writeCells(updates)
}

function onGridKeyDown(e: KeyboardEvent) {
  if (editing.value !== null) return
  const mod = e.metaKey || e.ctrlKey
  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault()
      return moveBy(-1, 0, e.shiftKey)
    case 'ArrowDown':
      e.preventDefault()
      return moveBy(1, 0, e.shiftKey)
    case 'ArrowLeft':
      e.preventDefault()
      return moveBy(0, -1, e.shiftKey)
    case 'ArrowRight':
      e.preventDefault()
      return moveBy(0, 1, e.shiftKey)
    case 'Tab':
      e.preventDefault()
      return moveBy(0, e.shiftKey ? -1 : 1)
    case 'Enter':
    case 'F2':
      e.preventDefault()
      return startEdit()
    case 'Delete':
    case 'Backspace':
      e.preventDefault()
      return clearRange()
  }
  if (mod && e.key.toLowerCase() === 'a') {
    e.preventDefault()
    anchor.value = { r: ROW_COUNT - 1, c: COL_COUNT - 1 }
    active.value = { r: 0, c: 0 }
  } else if (!mod && !e.altKey && e.key.length === 1) {
    // Typing over a cell replaces its content, like a spreadsheet
    e.preventDefault()
    startEdit(e.key)
  }
}

function onInputKeyDown(e: KeyboardEvent) {
  // Keep typing and caret keys away from the grid's navigation handler
  e.stopPropagation()
  if (e.key === 'Enter') {
    e.preventDefault()
    commit({ r: e.shiftKey ? -1 : 1, c: 0 })
  } else if (e.key === 'Tab') {
    e.preventDefault()
    commit({ r: 0, c: e.shiftKey ? -1 : 1 })
  } else if (e.key === 'Escape') {
    e.preventDefault()
    cancelEdit()
  }
}

function onCopy(e: ClipboardEvent) {
  if (editing.value !== null) return
  e.preventDefault()
  const { r1, r2, c1, c2 } = range.value
  const lines: string[] = []
  for (let r = r1; r <= r2; r++) {
    const cells: string[] = []
    for (let c = c1; c <= c2; c++) cells.push(computedSheet.value[r][c].text)
    lines.push(cells.join('\t'))
  }
  e.clipboardData?.setData('text/plain', lines.join('\n'))
}

function onPaste(e: ClipboardEvent) {
  if (editing.value !== null) return
  e.preventDefault()
  const text = (e.clipboardData?.getData('text/plain') ?? '').replace(/\r/g, '')
  const pasted = text.replace(/\n$/, '').split('\n').map((l) => l.split('\t'))
  const { r1, c1 } = range.value
  const updates: Array<[Pos, string]> = []
  let last: Pos = { r: r1, c: c1 }
  pasted.forEach((line, i) =>
    line.forEach((value, j) => {
      const pos = { r: r1 + i, c: c1 + j }
      if (pos.r >= ROW_COUNT || pos.c >= COL_COUNT) return
      updates.push([pos, value])
      last = pos
    }),
  )
  writeCells(updates)
  anchor.value = { r: r1, c: c1 }
  active.value = last
}

function onCellMouseDown(e: MouseEvent, pos: Pos) {
  if (e.button !== 0) return
  const insideEditor =
    editing.value !== null &&
    pos.r === active.value.r &&
    pos.c === active.value.c
  if (insideEditor) return
  commit(undefined, false)
  select(pos, e.shiftKey)
  dragging = true
}

function onCellEnter(pos: Pos) {
  if (dragging) active.value = pos
}

function onColumnMouseDown(c: number) {
  if (c < 0) return
  commit(undefined, false)
  anchor.value = { r: ROW_COUNT - 1, c }
  active.value = { r: 0, c }
}

function onRowMouseDown(r: number) {
  commit(undefined, false)
  anchor.value = { r, c: COL_COUNT - 1 }
  active.value = { r, c: 0 }
}

function focusInput(el: unknown) {
  if (el instanceof HTMLInputElement && document.activeElement !== el) {
    el.focus()
  }
}

const stats = computed(() => {
  const { r1, r2, c1, c2 } = range.value
  const numbers: number[] = []
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      const value = computedSheet.value[r][c].value
      if (value !== null) numbers.push(value)
    }
  }
  const total = numbers.reduce((sum, n) => sum + n, 0)
  return {
    count: numbers.length,
    total,
    multiple: r1 !== r2 || c1 !== c2,
  }
})
const fmt = (n: number) => String(Math.round(n * 1e4) / 1e4)
</script>

<template>
  <div>
    <div class="mb-2 flex items-center overflow-hidden rounded-md border text-sm">
      <div class="w-16 shrink-0 border-r bg-muted/50 px-2 py-1.5 text-center font-medium">
        {{ cellName(active) }}
      </div>
      <div
        class="min-w-0 flex-1 truncate px-3 py-1.5 font-mono text-xs"
        aria-label="Cell contents"
      >
        {{ editing ?? raw[active.r][active.c] }}
      </div>
    </div>

    <div
      ref="gridRef"
      tabindex="0"
      aria-label="Spreadsheet. Arrow keys move, Enter edits, Shift extends the selection."
      class="max-h-96 overflow-auto rounded-md border outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/50 [&_[data-slot=table-container]]:overflow-visible"
      @keydown="onGridKeyDown"
      @copy="onCopy"
      @paste="onPaste"
    >
      <Table class="min-w-xl table-fixed border-separate border-spacing-0">
        <TableHeader class="sticky top-0 z-20 [&_tr]:border-b-0">
          <TableRow
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
            class="hover:bg-transparent"
          >
            <TableHead
              v-for="header in headerGroup.headers"
              :key="header.id"
              :class="
                cn(
                  'h-8 border-r border-b bg-muted text-center text-xs font-medium',
                  COL_IDS.indexOf(header.column.id) < 0
                    ? 'sticky left-0 z-30 w-12'
                    : 'cursor-pointer text-muted-foreground',
                  COL_IDS.indexOf(header.column.id) >= range.c1 &&
                    COL_IDS.indexOf(header.column.id) <= range.c2 &&
                    'bg-accent text-foreground',
                )
              "
              @mousedown="onColumnMouseDown(COL_IDS.indexOf(header.column.id))"
            >
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            class="hover:bg-transparent"
          >
            <template v-for="cell in row.getVisibleCells()" :key="cell.id">
              <TableCell
                v-if="COL_IDS.indexOf(cell.column.id) < 0"
                :class="
                  cn(
                    'sticky left-0 z-10 h-8 cursor-pointer border-r border-b bg-muted p-0 text-center text-xs text-muted-foreground',
                    row.index >= range.r1 &&
                      row.index <= range.r2 &&
                      'bg-accent text-foreground',
                  )
                "
                @mousedown="onRowMouseDown(row.index)"
              >
                <FlexRender
                  :render="cell.column.columnDef.cell"
                  :props="cell.getContext()"
                />
              </TableCell>
              <TableCell
                v-else
                :data-active="
                  active.r === row.index &&
                  active.c === COL_IDS.indexOf(cell.column.id)
                "
                :class="
                  cn(
                    'relative h-8 scroll-ml-12 scroll-mt-8 truncate border-r border-b px-2 py-0',
                    row.original.cells[COL_IDS.indexOf(cell.column.id)].kind === 'number' &&
                      'text-right tabular-nums',
                    row.original.cells[COL_IDS.indexOf(cell.column.id)].kind === 'error' &&
                      'text-red-600 dark:text-red-400',
                    inRange(row.index, COL_IDS.indexOf(cell.column.id)) && 'bg-primary/10',
                    active.r === row.index &&
                      active.c === COL_IDS.indexOf(cell.column.id) &&
                      'outline-2 -outline-offset-2 outline-primary',
                  )
                "
                @mousedown="
                  onCellMouseDown($event, {
                    r: row.index,
                    c: COL_IDS.indexOf(cell.column.id),
                  })
                "
                @mouseenter="
                  onCellEnter({
                    r: row.index,
                    c: COL_IDS.indexOf(cell.column.id),
                  })
                "
                @dblclick="startEdit()"
              >
                <input
                  v-if="
                    editing !== null &&
                    active.r === row.index &&
                    active.c === COL_IDS.indexOf(cell.column.id)
                  "
                  :ref="focusInput"
                  v-model="editing"
                  :aria-label="`Edit ${cellName(active)}`"
                  class="absolute inset-0 size-full bg-background px-2 text-sm outline-2 -outline-offset-2 outline-primary select-text"
                  @keydown="onInputKeyDown"
                  @blur="commit(undefined, false)"
                />
                <FlexRender
                  v-else
                  :render="cell.column.columnDef.cell"
                  :props="cell.getContext()"
                />
              </TableCell>
            </template>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <p class="mt-3 text-xs text-muted-foreground tabular-nums" aria-live="polite">
      {{
        stats.multiple && stats.count > 0
          ? `Sum ${fmt(stats.total)} · Average ${fmt(stats.total / stats.count)} · Count ${stats.count}`
          : 'Type to edit · Enter or F2 edits · Shift + arrows select · Copy and paste work'
      }}
    </p>
  </div>
</template>
