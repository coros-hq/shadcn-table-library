import type { Priority, Status, Ticket } from './data'
import type { View } from './tickets'

export const statusStyle: Record<Status, { label: string; className: string }> =
  {
    open: {
      label: 'Open',
      className: 'border-blue-500/40 text-blue-700 dark:text-blue-400',
    },
    pending: {
      label: 'Pending',
      className: 'border-amber-500/50 text-amber-800 dark:text-amber-300',
    },
    solved: { label: 'Solved', className: 'text-muted-foreground' },
  }

export const priorityStyle: Record<Priority, { label: string; dot: string }> = {
  urgent: { label: 'Urgent', dot: 'bg-red-500' },
  high: { label: 'High', dot: 'bg-orange-400' },
  normal: { label: 'Normal', dot: 'bg-sky-500' },
  low: { label: 'Low', dot: 'bg-muted-foreground/40' },
}

/**
 * A ticket plus the values it sorts by. They match the ticket, except for
 * the open one, which keeps the values it had when it was opened: editing
 * it in the panel then doesn't send its row to another page.
 */
export type TicketRow = Ticket & { sortAs: Ticket }

export interface TicketMeta {
  /** The ticket shown in the panel */
  openId: string | null
  /** The status filter, to say when the open ticket no longer matches it */
  view: View
  open: (id: string) => void
}

/** The status filter, plus the open ticket, which stays while it's open */
export interface StatusFilter {
  view: View
  keep: string | null
}

export const PAGE_SIZE = 8
