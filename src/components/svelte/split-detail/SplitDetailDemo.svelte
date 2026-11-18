<script lang="ts">
  import { tick } from 'svelte'
  import type { PaginationState, SortingState } from '@tanstack/table-core'
  import { tickets as initialTickets } from './data'
  import type { Ticket } from './data'
  import { PAGE_SIZE } from './styles'
  import type { StatusFilter, TicketMeta, TicketRow } from './styles'
  import { createTicketTable } from './table'
  import TicketPanel from './TicketPanel.svelte'
  import TicketTable from './TicketTable.svelte'
  import { inView, replyTo, updateTicket, views } from './tickets'
  import type { View } from './tickets'

  // Replaced, never mutated, so raw state is enough
  let tickets = $state.raw<Ticket[]>(initialTickets)
  let view = $state<View>('open')
  let sorting = $state.raw<SortingState>([{ id: 'updated', desc: true }])
  let pagination = $state.raw<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  })
  let openId = $state<string | null>(null)
  // The open ticket as it was when opened, so it keeps its place in the sort
  let pinned = $state.raw<Ticket | null>(null)
  let filters = $state<HTMLElement>()

  function open(id: string | null) {
    openId = id
    pinned = tickets.find((t) => t.id === id) ?? null
  }

  const data: TicketRow[] = $derived(
    tickets.map((t) => ({
      ...t,
      sortAs: pinned && t.id === pinned.id ? pinned : t,
    })),
  )
  const columnFilters = $derived([
    { id: 'status', value: { view, keep: openId } satisfies StatusFilter },
  ])
  const meta: TicketMeta = $derived({ openId, view, open })

  const table = createTicketTable({
    get data() {
      return data
    },
    get sorting() {
      return sorting
    },
    get pagination() {
      return pagination
    },
    get columnFilters() {
      return columnFilters
    },
    get meta() {
      return meta
    },
    setSorting: (u) => (sorting = typeof u === 'function' ? u(sorting) : u),
    setPagination: (u) =>
      (pagination = typeof u === 'function' ? u(pagination) : u),
  })

  // Every ticket in the current filter and sort, across all pages
  const order = $derived(table.getPrePaginationRowModel().rows.map((r) => r.id))
  const index = $derived(openId ? order.indexOf(openId) : -1)
  const ticket = $derived(tickets.find((t) => t.id === openId) ?? null)

  /** Opens a neighbour, turning the page if it's on another one */
  function go(id: string) {
    open(id)
    const page = Math.floor(order.indexOf(id) / PAGE_SIZE)
    if (pagination.pageIndex !== page) pagination = { ...pagination, pageIndex: page }
  }

  // Bring the open row into view inside the table's own scroll area
  $effect(() => {
    const id = openId
    void pagination.pageIndex
    if (!id) return
    tick().then(() =>
      document
        .querySelector(`[data-ticket-row="${id}"]`)
        ?.scrollIntoView({ block: 'nearest' }),
    )
  })

  // A ticket that left the filter disappears on close; don't strand the
  // page past the end
  $effect(() => {
    const count = table.getPageCount()
    if (count && pagination.pageIndex >= count)
      pagination = { ...pagination, pageIndex: count - 1 }
  })

  function setView(next: View) {
    view = next
    pagination = { ...pagination, pageIndex: 0 }
  }

  const fallbackFocus = () =>
    filters?.querySelector<HTMLElement>('[aria-pressed="true"]')?.focus()
</script>

<div class="space-y-3">
  <div class="flex flex-wrap items-center justify-between gap-2">
    <div
      bind:this={filters}
      role="group"
      aria-label="Show tickets"
      class="inline-flex rounded-md border p-0.5"
    >
      {#each views as v (v.id)}
        <button
          type="button"
          aria-pressed={view === v.id}
          onclick={() => setView(v.id)}
          class="flex h-7 items-center gap-1.5 rounded px-2.5 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:bg-muted aria-pressed:text-foreground"
        >
          {v.label}
          <span class="text-xs tabular-nums">
            {tickets.filter((t) => inView(t, v.id)).length}
          </span>
        </button>
      {/each}
    </div>
    <p class="text-sm text-muted-foreground">Open a ticket by its subject.</p>
  </div>

  <!-- The table scrolls inside this frame, and the panel opens at its
       right, pushing the table over instead of covering it -->
  <div class="relative flex overflow-hidden rounded-md border">
    <TicketTable {table} panelOpen={openId !== null} />
    <TicketPanel
      {ticket}
      position={{ index: Math.max(index, 0), total: order.length }}
      onprevious={index > 0 ? () => go(order[index - 1]) : undefined}
      onnext={index >= 0 && index < order.length - 1
        ? () => go(order[index + 1])
        : undefined}
      onclose={() => open(null)}
      onchange={(changes) => {
        if (openId) tickets = updateTicket(tickets, openId, changes)
      }}
      onreply={(body) => {
        if (openId) tickets = replyTo(tickets, openId, 'You', body)
      }}
      {fallbackFocus}
    />
  </div>
</div>
