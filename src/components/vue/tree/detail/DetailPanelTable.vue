<script setup lang="ts">
import { ref } from 'vue'
import {
  FlexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import type { ColumnDef, ExpandedState, Row } from '@tanstack/vue-table'
import { valueUpdater, cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import ShipmentCard from './ShipmentCard.vue'
import type { Order, Shipment, TreeRow } from './data'

const props = defineProps<{
  columns: ColumnDef<TreeRow, any>[]
  data: Order[]
}>()

// The card takes this room from the table; its header repeats these values
const hiddenWhileOpen = { details: false, amount: false, date: false }

const expanded = ref<ExpandedState>(true)
// Kept after closing so the card keeps its content while it slides out
const panel = ref<{
  shipment: Shipment
  order: Order
  trigger: HTMLElement
  open: boolean
} | null>(null)

const table = useVueTable<TreeRow>({
  get data() {
    return props.data
  },
  get columns() {
    return props.columns
  },
  getRowId: (row) => row.id,
  getCoreRowModel: getCoreRowModel(),
  getSubRows: (row) => (row.kind === 'order' ? row.children : undefined),
  getExpandedRowModel: getExpandedRowModel(),
  onExpandedChange: (updater) => valueUpdater(updater, expanded),
  state: {
    get expanded() {
      return expanded.value
    },
    get columnVisibility() {
      return panel.value?.open ? hiddenWhileOpen : {}
    },
  },
})

function openShipment(row: Row<TreeRow>, event: Event) {
  const shipment = row.original
  const order = row.getParentRow()?.original
  if (shipment.kind !== 'shipment' || order?.kind !== 'order') return
  panel.value = {
    shipment,
    order,
    trigger: event.currentTarget as HTMLElement,
    open: true,
  }
}

function closePanel() {
  if (!panel.value) return
  panel.value = { ...panel.value, open: false }
  // The card is inert once closed, so hand focus back to the row that opened it
  panel.value.trigger.focus()
}
</script>

<template>
  <!-- The card is docked inside this box and pushes the table aside as it opens -->
  <div
    class="relative flex min-h-[36rem] overflow-hidden rounded-md border"
    @keydown.esc="panel?.open && closePanel()"
  >
    <div class="min-w-0 flex-1 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
          >
            <TableHead
              v-for="header in headerGroup.headers"
              :key="header.id"
              :style="{ width: `${header.column.columnDef.size}px` }"
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
            :tabindex="row.original.kind === 'shipment' ? 0 : undefined"
            :data-state="
              row.original.kind === 'shipment' &&
              panel?.open &&
              panel.shipment.id === row.id
                ? 'selected'
                : undefined
            "
            :class="
              cn(
                row.original.kind === 'shipment' &&
                  'cursor-pointer bg-muted/30 outline-none focus-visible:bg-muted',
              )
            "
            @click="row.original.kind === 'shipment' && openShipment(row, $event)"
            @keydown.enter.prevent="
              row.original.kind === 'shipment' && openShipment(row, $event)
            "
            @keydown.space.prevent="
              row.original.kind === 'shipment' && openShipment(row, $event)
            "
          >
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

    <ShipmentCard
      :open="panel?.open === true"
      :shipment="panel?.shipment ?? null"
      :order="panel?.order ?? null"
      @close="closePanel"
    />
  </div>
</template>
