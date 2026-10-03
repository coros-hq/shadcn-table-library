<script setup lang="ts">
import { computed, h, ref } from 'vue'
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
import ArchiveIcon from '@/components/ui/icons/ArchiveIcon.vue'
import ArrowsClockwiseIcon from '@/components/ui/icons/ArrowsClockwiseIcon.vue'
import BellRingingIcon from '@/components/ui/icons/BellRingingIcon.vue'
import StarIcon from '@/components/ui/icons/StarIcon.vue'
import TrashIcon from '@/components/ui/icons/TrashIcon.vue'
import type { IconHandle } from '@/components/ui/icons/useIconAnimation'
import { cn } from '@/lib/utils'
import type { TeamMember } from './columns'

// The parent owns the rows; this component pushes changes back through v-model
const data = defineModel<TeamMember[]>('data', { required: true })
const emit = defineEmits<{ reset: [] }>()

const refreshRef = ref<IconHandle | null>(null)

function toggle(id: string, key: 'favorite' | 'notify' | 'archived') {
  data.value = data.value.map((row) =>
    row.id === id ? { ...row, [key]: !row[key] } : row,
  )
}

function remove(id: string) {
  data.value = data.value.filter((row) => row.id !== id)
}

function handleReset() {
  refreshRef.value?.startAnimation()
  emit('reset')
}

const iconButton = 'rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground'

const columns = computed<ColumnDef<TeamMember>[]>(() => [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) =>
      h(
        'span',
        {
          class: cn(
            row.original.archived && 'text-muted-foreground line-through',
          ),
        },
        row.original.name,
      ),
  },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
  {
    id: 'actions',
    header: () => h('span', { class: 'sr-only' }, 'Actions'),
    cell: ({ row }) => {
      const member = row.original
      return h('div', { class: 'flex items-center justify-end gap-1' }, [
        h(
          'button',
          {
            type: 'button',
            'aria-label': member.favorite ? 'Unfavorite' : 'Favorite',
            'aria-pressed': member.favorite,
            title: member.favorite ? 'Unfavorite' : 'Favorite',
            onClick: () => toggle(member.id, 'favorite'),
            class: cn(
              iconButton,
              member.favorite && 'text-amber-500 hover:text-amber-500',
            ),
          },
          h(StarIcon, { size: 18, filled: member.favorite }),
        ),
        h(
          'button',
          {
            type: 'button',
            'aria-label': member.notify ? 'Mute notifications' : 'Notify',
            'aria-pressed': member.notify,
            title: member.notify ? 'Mute notifications' : 'Notify',
            onClick: () => toggle(member.id, 'notify'),
            class: cn(
              iconButton,
              member.notify && 'text-blue-500 hover:text-blue-500',
            ),
          },
          h(BellRingingIcon, { size: 18 }),
        ),
        h(
          'button',
          {
            type: 'button',
            'aria-label': member.archived ? 'Unarchive' : 'Archive',
            'aria-pressed': member.archived,
            title: member.archived ? 'Unarchive' : 'Archive',
            onClick: () => toggle(member.id, 'archived'),
            class: cn(iconButton, member.archived && 'text-foreground'),
          },
          h(ArchiveIcon, { size: 18 }),
        ),
        h(
          'button',
          {
            type: 'button',
            'aria-label': 'Delete',
            title: 'Delete',
            onClick: () => remove(member.id),
            class:
              'rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive',
          },
          h(TrashIcon, { size: 18 }),
        ),
      ])
    },
  },
])

const table = useVueTable({
  get data() {
    return data.value
  },
  get columns() {
    return columns.value
  },
  getCoreRowModel: getCoreRowModel(),
})
</script>

<template>
  <div>
    <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
      <p class="text-sm text-muted-foreground">
        Hover a row action to preview its motion; click to apply it.
      </p>
      <Button type="button" variant="outline" size="sm" @click="handleReset">
        <ArrowsClockwiseIcon ref="refreshRef" :size="16" />
        Reset
      </Button>
    </div>
    <div class="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
          >
            <TableHead
              v-for="header in headerGroup.headers"
              :key="header.id"
              :class="header.id === 'actions' ? 'text-right' : undefined"
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
          <template v-if="table.getRowModel().rows.length">
            <TableRow
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              :class="cn(row.original.archived && 'bg-muted/40')"
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
            <TableCell :colspan="columns.length" class="h-24 text-center">
              No team members. Click Reset to restore the demo data.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
