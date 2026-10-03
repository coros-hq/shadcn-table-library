<script setup lang="ts">
import { h, onBeforeUnmount, ref } from 'vue'
import {
  FlexRender,
  getCoreRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import type { ColumnDef } from '@tanstack/vue-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import ArchiveButton from './ArchiveButton.vue'
import DeleteButton from './DeleteButton.vue'
import SyncButton from './SyncButton.vue'
import { formatLastSynced } from './data'
import type { Source, SyncStatus } from './data'

const statusStyle: Record<SyncStatus, { dot: string; label: string }> = {
  synced: { dot: 'bg-emerald-500', label: 'Synced' },
  syncing: { dot: 'bg-sky-500 animate-pulse', label: 'Syncing…' },
  failed: { dot: 'bg-red-500', label: 'Failed' },
}

// How long the fake request, the exit fade, and the confirm/undo windows last
const REQUEST_MS = 1500
const EXIT_MS = 450
const CONFIRM_MS = 3000
const UNDO_MS = 6000

const props = defineProps<{ initialData: Source[] }>()

const sources = ref<Source[]>(props.initialData)
const confirmingId = ref<string | null>(null)
const leaving = ref<Set<string>>(new Set())
const archived = ref<{ source: Source; index: number } | null>(null)

// Every pending timeout, so none fire after unmount or a reset
const timers = new Set<number>()
const later = (fn: () => void, ms: number) => {
  const id = window.setTimeout(() => {
    timers.delete(id)
    fn()
  }, ms)
  timers.add(id)
  return id
}
onBeforeUnmount(() => timers.forEach((id) => window.clearTimeout(id)))
let confirmTimer: number | undefined
let undoTimer: number | undefined

const update = (id: string, patch: Partial<Source>) => {
  sources.value = sources.value.map((s) => (s.id === id ? { ...s, ...patch } : s))
}

function sync(id: string) {
  update(id, { status: 'syncing' })
  later(() => {
    sources.value = sources.value.map((s) => {
      if (s.id !== id) return s
      return s.failsNext
        ? {
            ...s,
            status: 'failed',
            error: 'Connection timed out',
            failsNext: false,
          }
        : { ...s, status: 'synced', lastSyncedMin: 0, error: undefined }
    })
  }, REQUEST_MS)
}

// Fade the row out first so the icon's motion is visible, then remove it
function removeAfterExit(
  id: string,
  onRemoved?: (source: Source, index: number) => void,
) {
  leaving.value = new Set(leaving.value).add(id)
  later(() => {
    const index = sources.value.findIndex((s) => s.id === id)
    if (index !== -1) onRemoved?.(sources.value[index], index)
    sources.value = sources.value.filter((s) => s.id !== id)
    const next = new Set(leaving.value)
    next.delete(id)
    leaving.value = next
  }, EXIT_MS)
}

function archive(id: string) {
  removeAfterExit(id, (source, index) => {
    archived.value = { source, index }
    window.clearTimeout(undoTimer)
    undoTimer = later(() => (archived.value = null), UNDO_MS)
  })
}

function undoArchive() {
  if (!archived.value) return
  window.clearTimeout(undoTimer)
  const next = [...sources.value]
  next.splice(
    Math.min(archived.value.index, next.length),
    0,
    archived.value.source,
  )
  sources.value = next
  archived.value = null
}

function requestDelete(id: string) {
  confirmingId.value = id
  window.clearTimeout(confirmTimer)
  confirmTimer = later(() => (confirmingId.value = null), CONFIRM_MS)
}

function confirmDelete(id: string) {
  window.clearTimeout(confirmTimer)
  confirmingId.value = null
  removeAfterExit(id)
}

function reset() {
  timers.forEach((id) => window.clearTimeout(id))
  timers.clear()
  sources.value = props.initialData
  confirmingId.value = null
  leaving.value = new Set()
  archived.value = null
}

// Cell renderers read the refs above while rendering, so only the affected
// cells update when a row's state changes.
const columns: ColumnDef<Source>[] = [
  {
    accessorKey: 'name',
    header: 'Source',
    cell: ({ row }) =>
      h('div', [
        h('p', { class: 'font-medium' }, row.original.name),
        h('p', { class: 'text-xs text-muted-foreground' }, row.original.kind),
      ]),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const { status, error } = row.original
      return h('div', { class: 'flex items-center gap-2' }, [
        h('span', { class: cn('size-1.5 rounded-full', statusStyle[status].dot) }),
        h('span', statusStyle[status].label),
        status === 'failed' && error
          ? h('span', { class: 'text-xs text-muted-foreground' }, `· ${error}`)
          : null,
      ])
    },
  },
  {
    accessorKey: 'lastSyncedMin',
    header: 'Last synced',
    cell: ({ row }) =>
      h(
        'span',
        { class: 'text-muted-foreground' },
        formatLastSynced(row.original.lastSyncedMin),
      ),
  },
  {
    id: 'actions',
    header: () => h('span', { class: 'sr-only' }, 'Actions'),
    cell: ({ row }) => {
      const source = row.original
      const busy = source.status === 'syncing' || leaving.value.has(source.id)
      return h('div', { class: 'flex items-center justify-end gap-1' }, [
        h(SyncButton, { status: source.status, onSync: () => sync(source.id) }),
        h(ArchiveButton, {
          name: source.name,
          disabled: busy,
          concealed: confirmingId.value === source.id,
          onArchive: () => archive(source.id),
        }),
        h(DeleteButton, {
          name: source.name,
          confirming: confirmingId.value === source.id,
          disabled: busy,
          onRequest: () => requestDelete(source.id),
          onConfirm: () => confirmDelete(source.id),
          onCancel: () => (confirmingId.value = null),
        }),
      ])
    },
  },
]

const table = useVueTable({
  get data() {
    return sources.value
  },
  columns,
  getRowId: (row) => row.id,
  getCoreRowModel: getCoreRowModel(),
})
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <p class="text-sm text-muted-foreground">
        Sync, archive, or delete a source. S3 fails its first sync on purpose.
      </p>
      <Button type="button" variant="ghost" size="sm" @click="reset">
        Reset demo
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
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="table.getRowModel().rows.length">
            <TableRow
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              :class="
                cn(
                  'transition-opacity duration-300',
                  leaving.has(row.id) && 'opacity-0',
                )
              "
            >
              <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                <FlexRender
                  :render="cell.column.columnDef.cell"
                  :props="cell.getContext()"
                />
              </TableCell>
            </TableRow>
          </template>
          <TableRow v-else>
            <TableCell
              :colspan="columns.length"
              class="h-24 text-center text-muted-foreground"
            >
              No sources left. Use Reset demo to bring them back.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <div aria-live="polite" class="min-h-9">
      <div
        v-if="archived"
        class="flex items-center justify-between gap-3 rounded-md border px-3 py-1.5 text-sm"
      >
        <span>
          Archived <span class="font-medium">{{ archived.source.name }}</span>
        </span>
        <Button
          type="button"
          variant="link"
          size="sm"
          class="h-auto px-0"
          @click="undoArchive"
        >
          Undo
        </Button>
      </div>
    </div>
  </div>
</template>
