import { NOW, priorities } from './data'
import type { Agent, Priority, Status, Ticket } from './data'

export type View = 'all' | Status

export const views: { id: View; label: string }[] = [
  { id: 'open', label: 'Open' },
  { id: 'pending', label: 'Pending' },
  { id: 'solved', label: 'Solved' },
  { id: 'all', label: 'All' },
]

export const inView = (ticket: Ticket, view: View) =>
  view === 'all' || ticket.status === view

/** Urgent first: a lower rank sorts higher */
export const priorityRank = (p: Priority) => priorities.indexOf(p)

export interface Changes {
  status?: Status
  priority?: Priority
  assignee?: Agent
}

/** One ticket with new field values; the rest untouched */
export const updateTicket = (
  tickets: Ticket[],
  id: string,
  changes: Changes,
): Ticket[] =>
  tickets.map((t) => (t.id === id ? { ...t, ...changes, updated: NOW } : t))

/**
 * Adds the agent's reply. An open ticket becomes pending, since it now
 * waits on the customer.
 */
export const replyTo = (
  tickets: Ticket[],
  id: string,
  author: string,
  body: string,
): Ticket[] =>
  tickets.map((t) =>
    t.id === id
      ? {
          ...t,
          status: t.status === 'open' ? 'pending' : t.status,
          updated: NOW,
          messages: [
            ...t.messages,
            { from: 'agent', author, at: NOW, body: body.trim() },
          ],
        }
      : t,
  )

// Minutes since an epoch for a time like "2026-11-17T09:40"; no Date, so no time zones
const minutes = (at: string) => {
  const [date, time] = at.split('T')
  const [y, m, d] = date.split('-').map(Number)
  const [h, mi] = time.split(':').map(Number)
  return Date.UTC(y, m - 1, d, h, mi) / 60_000
}

/** "just now", "25m ago", "3h ago", "2d ago" */
export function timeAgo(at: string) {
  const diff = minutes(NOW) - minutes(at)
  if (diff < 1) return 'just now'
  if (diff < 60) return `${diff}m ago`
  if (diff < 24 * 60) return `${Math.floor(diff / 60)}h ago`
  return `${Math.floor(diff / (24 * 60))}d ago`
}

const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

/** "Nov 17, 09:40" */
export function formatTime(at: string) {
  const [date, time] = at.split('T')
  const [, m, d] = date.split('-').map(Number)
  return `${months[m - 1]} ${d}, ${time}`
}

export const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
