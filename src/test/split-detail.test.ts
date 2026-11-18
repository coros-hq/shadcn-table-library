import { describe, expect, it } from 'vitest'
import { NOW, tickets } from '#/components/split-detail/data'
import {
  formatTime,
  inView,
  initials,
  priorityRank,
  replyTo,
  timeAgo,
  updateTicket,
} from '#/components/split-detail/tickets'

const byId = (id: string) => tickets.find((t) => t.id === id)!

describe('data', () => {
  it('has unique ids and a first message from the customer', () => {
    expect(new Set(tickets.map((t) => t.id)).size).toBe(tickets.length)
    for (const t of tickets) {
      expect(t.messages[0]).toMatchObject({
        from: 'customer',
        author: t.customer.name,
      })
      expect(t.updated >= t.created).toBe(true)
    }
  })

  it('has open tickets to filter to', () => {
    expect(tickets.filter((t) => inView(t, 'open')).length).toBeGreaterThan(8)
    expect(tickets.every((t) => inView(t, 'all'))).toBe(true)
  })
})

describe('editing', () => {
  it('updates one ticket and stamps it', () => {
    const next = updateTicket(tickets, 'TCK-1041', {
      assignee: 'Grace Lee',
      priority: 'high',
    })
    expect(next.find((t) => t.id === 'TCK-1041')).toMatchObject({
      assignee: 'Grace Lee',
      priority: 'high',
      updated: NOW,
    })
    expect(byId('TCK-1041').assignee).toBe('Unassigned')
    expect(next[0]).toBe(tickets[0])
  })

  it('moves an open ticket to pending on reply', () => {
    const next = replyTo(tickets, 'TCK-1041', 'You', '  On it.  ')
    const t = next.find((x) => x.id === 'TCK-1041')!
    expect(t.status).toBe('pending')
    expect(t.messages.at(-1)).toEqual({
      from: 'agent',
      author: 'You',
      at: NOW,
      body: 'On it.',
    })
  })

  it('leaves a solved ticket solved on reply', () => {
    const solved = tickets.find((t) => t.status === 'solved')!
    const next = replyTo(tickets, solved.id, 'You', 'Follow-up')
    expect(next.find((t) => t.id === solved.id)?.status).toBe('solved')
  })
})

describe('formatting', () => {
  it('says how long ago, from the fixed now', () => {
    expect(timeAgo(NOW)).toBe('just now')
    expect(timeAgo('2026-11-17T14:20')).toBe('40m ago')
    expect(timeAgo('2026-11-17T09:41')).toBe('5h ago')
    expect(timeAgo('2026-11-15T18:20')).toBe('1d ago')
    expect(formatTime('2026-11-17T09:40')).toBe('Nov 17, 09:40')
  })

  it('ranks urgent first and makes initials', () => {
    expect(priorityRank('urgent')).toBeLessThan(priorityRank('low'))
    expect(initials('Nadia Rahman')).toBe('NR')
  })
})
