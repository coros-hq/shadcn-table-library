<script setup lang="ts">
import { computed, nextTick, ref, shallowRef, watch } from 'vue'
import type { PaginationState, SortingState } from '@tanstack/vue-table'
import { tickets as initialTickets } from './data'
import type { Ticket } from './data'
import { PAGE_SIZE } from './styles'
import type { TicketMeta } from './styles'
import { useTicketTable } from './table'
import TicketPanel from './TicketPanel.vue'
import TicketTable from './TicketTable.vue'
import { inView, replyTo, updateTicket, views } from './tickets'
import type { Changes, View } from './tickets'

// Replaced, never mutated, so shallow refs are enough
const tickets = shallowRef<Ticket[]>(initialTickets)
const view = ref<View>('open')
const sorting = ref<SortingState>([{ id: 'updated', desc: true }])
const pagination = ref<PaginationState>({ pageIndex: 0, pageSize: PAGE_SIZE })
const openId = ref<string | null>(null)
// The open ticket as it was when opened, so it keeps its place in the sort
const pinned = shallowRef<Ticket | null>(null)
const filters = ref<HTMLElement>()

function open(id: string | null) {
  openId.value = id
  pinned.value = tickets.value.find((t) => t.id === id) ?? null
}

const meta = computed<TicketMeta>(() => ({
  openId: openId.value,
  view: view.value,
  open,
}))

const table = useTicketTable({
  tickets,
  pinned,
  view,
  sorting,
  pagination,
  meta,
})

// Every ticket in the current filter and sort, across all pages
const order = computed(() =>
  table.getPrePaginationRowModel().rows.map((r) => r.id),
)
const index = computed(() =>
  openId.value ? order.value.indexOf(openId.value) : -1,
)
const ticket = computed(
  () => tickets.value.find((t) => t.id === openId.value) ?? null,
)

/** Opens a neighbour, turning the page if it's on another one */
function go(id: string) {
  open(id)
  const page = Math.floor(order.value.indexOf(id) / PAGE_SIZE)
  if (pagination.value.pageIndex !== page)
    pagination.value = { ...pagination.value, pageIndex: page }
}

// Bring the open row into view inside the table's own scroll area
watch([openId, () => pagination.value.pageIndex], async () => {
  if (!openId.value) return
  await nextTick()
  document
    .querySelector(`[data-ticket-row="${openId.value}"]`)
    ?.scrollIntoView({ block: 'nearest' })
})

// A ticket that left the filter disappears on close; don't strand the page
// past the end
watch(
  () => table.getPageCount(),
  (count) => {
    if (count && pagination.value.pageIndex >= count)
      pagination.value = { ...pagination.value, pageIndex: count - 1 }
  },
)

function setView(next: View) {
  view.value = next
  pagination.value = { ...pagination.value, pageIndex: 0 }
}

function change(changes: Changes) {
  if (openId.value)
    tickets.value = updateTicket(tickets.value, openId.value, changes)
}

function reply(body: string) {
  if (openId.value)
    tickets.value = replyTo(tickets.value, openId.value, 'You', body)
}

const fallbackFocus = () =>
  filters.value?.querySelector<HTMLElement>('[aria-pressed="true"]')?.focus()
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div
        ref="filters"
        role="group"
        aria-label="Show tickets"
        class="inline-flex rounded-md border p-0.5"
      >
        <button
          v-for="v in views"
          :key="v.id"
          type="button"
          :aria-pressed="view === v.id"
          class="flex h-7 items-center gap-1.5 rounded px-2.5 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:bg-muted aria-pressed:text-foreground"
          @click="setView(v.id)"
        >
          {{ v.label }}
          <span class="text-xs tabular-nums">
            {{ tickets.filter((t) => inView(t, v.id)).length }}
          </span>
        </button>
      </div>
      <p class="text-sm text-muted-foreground">Open a ticket by its subject.</p>
    </div>

    <!-- The table scrolls inside this frame, and the panel opens at its
         right, pushing the table over instead of covering it -->
    <div class="relative flex overflow-hidden rounded-md border">
      <TicketTable :table="table" :panel-open="openId !== null" />
      <TicketPanel
        :ticket="ticket"
        :position="{ index: Math.max(index, 0), total: order.length }"
        :has-previous="index > 0"
        :has-next="index >= 0 && index < order.length - 1"
        :fallback-focus="fallbackFocus"
        @previous="go(order[index - 1])"
        @next="go(order[index + 1])"
        @close="open(null)"
        @change="change"
        @reply="reply"
      />
    </div>
  </div>
</template>
