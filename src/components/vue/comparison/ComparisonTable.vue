<script setup lang="ts">
import { computed, h } from 'vue'
import {
  FlexRender,
  getCoreRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import type { ColumnDef } from '@tanstack/vue-table'
import { Check, X } from '@lucide/vue'
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
import type { Feature, FeatureValue, Plan } from './comparison'

const props = defineProps<{
  plans: Plan[]
  features: Feature[]
}>()

function renderValue(value: FeatureValue) {
  if (typeof value === 'boolean') {
    return value
      ? h(Check, {
          class: 'mx-auto h-4 w-4 text-emerald-600 dark:text-emerald-500',
        })
      : h(X, { class: 'mx-auto h-4 w-4 text-muted-foreground/40' })
  }
  return value
}

const columns = computed<ColumnDef<Feature>[]>(() => [
  {
    id: 'feature',
    header: '',
    accessorKey: 'label',
    cell: ({ getValue }) =>
      h('span', { class: 'text-sm text-muted-foreground' }, getValue() as string),
  },
  ...props.plans.map(
    (plan): ColumnDef<Feature> => ({
      id: plan.id,
      header: plan.name,
      accessorFn: (feature) => feature.values[plan.id],
      cell: ({ getValue }) =>
        h('div', { class: 'text-center' }, [
          renderValue(getValue() as FeatureValue),
        ]),
    }),
  ),
])

const table = useVueTable({
  get data() {
    return props.features
  },
  get columns() {
    return columns.value
  },
  getCoreRowModel: getCoreRowModel(),
})

const isHighlighted = (columnId: string) =>
  props.plans.find((p) => p.id === columnId)?.highlighted
</script>

<template>
  <div class="overflow-hidden rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead />
          <TableHead
            v-for="plan in plans"
            :key="plan.id"
            :class="
              cn(
                'py-4 align-bottom text-center',
                plan.highlighted && 'bg-primary/5',
              )
            "
          >
            <div class="space-y-1">
              <p class="text-sm font-semibold text-foreground">
                {{ plan.name }}
              </p>
              <p class="text-2xl font-bold text-foreground">
                {{ plan.price }}
                <span class="text-sm font-normal text-muted-foreground">
                  {{ plan.period }}
                </span>
              </p>
              <Button
                type="button"
                size="sm"
                :variant="plan.highlighted ? 'default' : 'outline'"
                class="mt-2 w-full"
              >
                {{ plan.cta }}
              </Button>
            </div>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="row in table.getRowModel().rows" :key="row.id">
          <TableCell
            v-for="cell in row.getVisibleCells()"
            :key="cell.id"
            :class="cn(isHighlighted(cell.column.id) && 'bg-primary/5')"
          >
            <FlexRender
              :render="cell.column.columnDef.cell"
              :props="cell.getContext()"
            />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
