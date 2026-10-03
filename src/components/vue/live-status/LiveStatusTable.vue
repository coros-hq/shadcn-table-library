<script setup lang="ts">
import { onBeforeUnmount, ref, watchEffect } from 'vue'
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
import type { Service, ServiceStatus } from './columns'

const TRANSITIONS: Record<ServiceStatus, ServiceStatus[]> = {
  operational: ['operational', 'operational', 'operational', 'degraded'],
  degraded: ['operational', 'operational', 'degraded', 'down'],
  down: ['degraded', 'down', 'down'],
}

function nextStatus(status: ServiceStatus): ServiceStatus {
  const options = TRANSITIONS[status]
  return options[Math.floor(Math.random() * options.length)]
}

function jitterLatency(latencyMs: number, status: ServiceStatus) {
  if (status === 'down') return 0
  const drift = status === 'degraded' ? 40 : 12
  const next = latencyMs + Math.round((Math.random() - 0.5) * drift)
  return Math.max(1, next)
}

// The parent owns the rows; this component only pushes updates back through v-model
const data = defineModel<Service[]>('data', { required: true })

const isLive = ref(true)
let cursor = 0
let interval: number | undefined

function tick() {
  const index = cursor % data.value.length
  cursor += 1
  data.value = data.value.map((service, i) => {
    if (i !== index) return service
    const status = nextStatus(service.status)
    return {
      ...service,
      status,
      latencyMs: jitterLatency(service.latencyMs, status),
    }
  })
}

// Re-runs whenever isLive flips: stop any running timer, start a new one if live
watchEffect(() => {
  window.clearInterval(interval)
  if (isLive.value) interval = window.setInterval(tick, 1800)
})

onBeforeUnmount(() => window.clearInterval(interval))

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
    <div class="mb-3 flex items-center justify-between">
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        @click="isLive = !isLive"
      >
        <span class="relative flex size-2">
          <span
            v-if="isLive"
            class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"
          />
          <span
            :class="
              cn(
                'relative inline-flex size-2 rounded-full',
                isLive ? 'bg-emerald-500' : 'bg-muted-foreground',
              )
            "
          />
        </span>
        {{ isLive ? 'Live' : 'Paused' }}
      </button>
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
