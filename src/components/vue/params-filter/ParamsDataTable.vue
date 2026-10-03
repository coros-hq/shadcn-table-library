<script setup lang="ts" generic="TData extends { role: string }, TValue">
import { computed } from 'vue'
import {
  FlexRender,
  getCoreRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import type { ColumnDef } from '@tanstack/vue-table'
import { X } from '@lucide/vue'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/**
 * Filter state (search/role) is fully controlled by the caller through
 * v-model — this component doesn't know or care whether it's backed by the
 * URL, vue-router, Pinia, or a plain ref. See `useUrlFilters.ts`.
 */
const props = defineProps<{
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  roleOptions: string[]
}>()

const search = defineModel<string>('search', { required: true })
const role = defineModel<string>('role', { required: true })

const filteredData = computed(() =>
  props.data.filter((row) => {
    const matchesSearch = search.value
      ? Object.values(row as Record<string, unknown>).some((value) =>
          String(value).toLowerCase().includes(search.value.toLowerCase()),
        )
      : true
    const matchesRole = role.value ? row.role === role.value : true
    return matchesSearch && matchesRole
  }),
)

const table = useVueTable({
  get data() {
    return filteredData.value
  },
  get columns() {
    return props.columns
  },
  getCoreRowModel: getCoreRowModel(),
})

const hasFilters = computed(() => Boolean(search.value || role.value))

function clearFilters() {
  search.value = ''
  role.value = ''
}
</script>

<template>
  <div>
    <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
      <Input
        v-model="search"
        type="text"
        placeholder="Search..."
        class="w-full sm:w-64"
      />
      <div class="flex flex-wrap items-center gap-2">
        <Select
          :model-value="role || 'all'"
          @update:model-value="(value) => (role = value === 'all' ? '' : String(value))"
        >
          <SelectTrigger class="w-40">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem v-for="option in roleOptions" :key="option" :value="option">
              {{ option }}
            </SelectItem>
          </SelectContent>
        </Select>
        <Button
          v-if="hasFilters"
          variant="link"
          class="underline"
          @click="clearFilters"
        >
          Clear Filters <X class="h-3 w-3" />
        </Button>
      </div>
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
          <template v-if="table.getRowModel().rows.length">
            <TableRow v-for="row in table.getRowModel().rows" :key="row.id">
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
              No results.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
