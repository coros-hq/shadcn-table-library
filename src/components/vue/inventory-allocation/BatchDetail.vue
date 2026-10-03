<script setup lang="ts">
import { computed } from 'vue'
import { Wand2 } from '@lucide/vue'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { InventoryTableMeta, SkuRow } from './columns'
import EditableNumberCell from './EditableNumberCell.vue'
import { deriveMetrics, isExpired } from './formulas'

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })

const props = defineProps<{
  row: SkuRow
  meta: InventoryTableMeta
}>()

const metrics = computed(() => deriveMetrics(props.row))
const earliestUsable = computed(
  () =>
    [...props.row.batches]
      .filter((b) => !isExpired(b))
      .sort((a, b) => a.expiresOn.localeCompare(b.expiresOn))[0]?.id,
)

// Everything allocated to this SKU except this batch — the ceiling for a new
// value here is whatever's left of orderedQty.
function validateAllocation(batch: SkuRow['batches'][number], n: number) {
  const allocatedElsewhere = metrics.value.allocated - batch.allocated
  if (n > batch.onHand) return `Only ${batch.onHand} on hand`
  if (allocatedElsewhere + n > props.row.orderedQty) {
    return `Max ${props.row.orderedQty - allocatedElsewhere} — order is ${props.row.orderedQty}`
  }
  return null
}
</script>

<template>
  <!-- The detail cell spans every column of a wide, horizontally scrolling
       grid — cap the panel's width and pin it left so it stays readable and
       in view however far the master table is scrolled. -->
  <div class="sticky left-4 max-w-2xl space-y-3">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <p class="text-sm text-muted-foreground">
        <span class="font-medium text-foreground">{{ row.orderedQty.toLocaleString() }}</span>
        units on open orders ·
        <span class="font-medium text-foreground">{{ metrics.allocated.toLocaleString() }}</span>
        allocated
        <template v-if="metrics.unallocated > 0">
          ·
          <span class="font-medium text-amber-700 dark:text-amber-400">
            {{ metrics.unallocated.toLocaleString() }} still open
          </span>
        </template>
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        @click="meta.autoAllocate(row.sku)"
      >
        <Wand2 class="size-3.5" />
        Auto-allocate (FEFO)
      </Button>
    </div>

    <div class="overflow-hidden rounded-md border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Lot</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead class="text-right">On hand</TableHead>
            <TableHead>Allocated</TableHead>
            <TableHead class="text-right">Free</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="batch in row.batches"
            :key="batch.id"
            :class="cn(isExpired(batch) && 'text-muted-foreground')"
          >
            <TableCell class="font-mono text-xs">{{ batch.lot }}</TableCell>
            <TableCell>{{ batch.location }}</TableCell>
            <TableCell>
              <span class="flex items-center gap-2 whitespace-nowrap">
                {{ formatDate(batch.expiresOn) }}
                <Badge
                  v-if="isExpired(batch)"
                  variant="outline"
                  class="border-transparent bg-destructive/15 text-destructive dark:text-red-300"
                >
                  Expired
                </Badge>
                <Badge v-else-if="batch.id === earliestUsable" variant="outline">
                  Pick first
                </Badge>
              </span>
            </TableCell>
            <TableCell class="text-right tabular-nums">
              {{ batch.onHand.toLocaleString() }}
            </TableCell>
            <TableCell>
              <EditableNumberCell
                :label="`Allocated from lot ${batch.lot}`"
                :value="batch.allocated"
                :disabled="isExpired(batch)"
                :validate="(n) => validateAllocation(batch, n)"
                @commit="(n) => meta.updateBatch(row.sku, batch.id, n)"
              />
            </TableCell>
            <TableCell class="text-right tabular-nums">
              {{ isExpired(batch) ? '—' : (batch.onHand - batch.allocated).toLocaleString() }}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
