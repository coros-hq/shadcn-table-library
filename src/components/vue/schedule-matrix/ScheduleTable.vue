<script setup lang="ts">
import { ref } from 'vue'
import { FlexRender, getCoreRowModel, useVueTable } from '@tanstack/vue-table'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { columns } from './columns'
import type { ScheduleMeta } from './columns'
import { days, people } from './data'
import type { Assignment, Schedule } from './data'
import { cellKey, fromKey } from './schedule'

const props = defineProps<{
  schedule: Schedule
  changed: Set<string>
  assign: (personId: string, day: number, value: Assignment) => void
}>()

const root = ref<HTMLElement>()
const active = ref(cellKey(people[0].id, 0))

const isDay = (id: string) => days.some((d) => d.id === id)
const weekend = (id: string) => days.find((d) => d.id === id)?.weekend

function focusCell(row: number, day: number) {
  const r = Math.max(0, Math.min(people.length - 1, row))
  const d = Math.max(0, Math.min(days.length - 1, day))
  const key = cellKey(people[r].id, d)
  active.value = key
  root.value?.querySelector<HTMLElement>(`[data-cell="${key}"]`)?.focus()
}

function onCellKeydown(event: KeyboardEvent, personId: string, day: number) {
  if (event.metaKey || event.ctrlKey || event.altKey) return
  const row = people.findIndex((p) => p.id === personId)
  const move: Record<string, [number, number]> = {
    ArrowUp: [row - 1, day],
    ArrowDown: [row + 1, day],
    ArrowLeft: [row, day - 1],
    ArrowRight: [row, day + 1],
    Home: [row, 0],
    End: [row, days.length - 1],
  }
  if (event.key in move) {
    event.preventDefault()
    focusCell(...move[event.key])
    return
  }
  const value = fromKey(event.key)
  if (value === undefined) return
  event.preventDefault()
  props.assign(personId, day, value)
  // Typing a shift moves on to the next day, so a week fills in one go
  if (value !== null) focusCell(row, day + 1)
}

// Whichever cell gets focus, by click or by Tab, becomes the tab stop
function onFocusin(event: FocusEvent) {
  const key = (event.target as HTMLElement).dataset.cell
  if (key) active.value = key
}

const table = useVueTable({
  data: people,
  columns,
  getRowId: (person) => person.id,
  getCoreRowModel: getCoreRowModel(),
  get meta(): ScheduleMeta {
    return {
      schedule: props.schedule,
      changed: props.changed,
      active: active.value,
      assign: props.assign,
      onCellKeydown,
    }
  },
})

const sticky = 'sticky left-0 z-10 bg-background'
</script>

<template>
  <div
    ref="root"
    class="overflow-x-auto rounded-md border"
    @focusin="onFocusin"
  >
    <Table class="min-w-[760px] table-fixed">
      <colgroup>
        <col class="w-32 sm:w-48" />
        <col v-for="d in days" :key="d.id" />
        <col class="w-28" />
      </colgroup>
      <TableHeader>
        <TableRow
          v-for="group in table.getHeaderGroups()"
          :key="group.id"
          class="hover:bg-transparent"
        >
          <TableHead
            v-for="header in group.headers"
            :key="header.id"
            :class="
              cn(
                'h-auto py-2',
                header.column.id === 'person' && sticky,
                isDay(header.column.id) && 'text-center',
                weekend(header.column.id) && 'bg-muted/50',
              )
            "
          >
            <FlexRender
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
          <TableCell
            v-for="cell in row.getVisibleCells()"
            :key="cell.id"
            :class="
              cn(
                isDay(cell.column.id) ? 'p-1' : 'py-1.5',
                cell.column.id === 'person' && sticky,
                weekend(cell.column.id) && 'bg-muted/50',
              )
            "
          >
            <FlexRender
              :render="cell.column.columnDef.cell"
              :props="cell.getContext()"
            />
          </TableCell>
        </TableRow>
      </TableBody>
      <TableFooter class="bg-transparent">
        <TableRow
          v-for="group in table.getFooterGroups().slice(0, 1)"
          :key="group.id"
          class="hover:bg-transparent"
        >
          <TableCell
            v-for="header in group.headers"
            :key="header.id"
            :class="
              cn(
                'py-2 align-top',
                header.column.id === 'person' && sticky,
                weekend(header.column.id) && 'bg-muted/50',
              )
            "
          >
            <FlexRender
              :render="header.column.columnDef.footer"
              :props="header.getContext()"
            />
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  </div>
</template>
