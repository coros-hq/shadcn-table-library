import { computed } from 'vue'
import type { Ref } from 'vue'
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import type { PaginationState, SortingState } from '@tanstack/vue-table'
import { valueUpdater } from '@/lib/utils'
import { columns } from './columns'
import type { Ticket } from './data'
import type { StatusFilter, TicketMeta, TicketRow } from './styles'
import type { View } from './tickets'

/**
 * The table lives in the demo, not in the component that draws it: the
 * panel's previous and next buttons need its sorted, filtered order.
 */
export function useTicketTable(options: {
  tickets: Ref<Ticket[]>
  /** The open ticket as it was when opened; it sorts by these values */
  pinned: Ref<Ticket | null>
  view: Ref<View>
  sorting: Ref<SortingState>
  pagination: Ref<PaginationState>
  meta: Ref<TicketMeta>
}) {
  const data = computed<TicketRow[]>(() =>
    options.tickets.value.map((t) => ({
      ...t,
      sortAs:
        options.pinned.value && t.id === options.pinned.value.id
          ? options.pinned.value
          : t,
    })),
  )
  // Computed: a new array every render would count as a filter change
  const columnFilters = computed(() => [
    {
      id: 'status',
      value: {
        view: options.view.value,
        keep: options.meta.value.openId,
      } satisfies StatusFilter,
    },
  ])

  return useVueTable({
    get data() {
      return data.value
    },
    columns,
    getRowId: (ticket) => ticket.id,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      get sorting() {
        return options.sorting.value
      },
      get pagination() {
        return options.pagination.value
      },
      get columnFilters() {
        return columnFilters.value
      },
    },
    onSortingChange: (u) => valueUpdater(u, options.sorting),
    onPaginationChange: (u) => valueUpdater(u, options.pagination),
    // Editing a ticket or opening one must not move you to page 1; the demo
    // resets the page itself when the filter changes
    autoResetPageIndex: false,
    get meta() {
      return options.meta.value
    },
  })
}
