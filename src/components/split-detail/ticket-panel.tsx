import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { ChevronDown, ChevronUp, SendHorizontal, X } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { Label } from '#/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { cn } from '#/lib/utils'
import { agents, priorities, statuses } from './data'
import type { Ticket } from './data'
import { PriorityLabel, statusStyle } from './columns'
import { formatTime, initials } from './tickets'
import type { Changes } from './tickets'

interface PanelProps {
  /** The ticket to show, or null when the panel is closed */
  ticket: Ticket | null
  /** "3 of 9" in the current filter and sort */
  position: { index: number; total: number }
  onPrevious?: () => void
  onNext?: () => void
  onClose: () => void
  onChange: (changes: Changes) => void
  onReply: (body: string) => void
  /** Where focus goes on close when the ticket's row is gone */
  fallbackFocus: () => void
}

export function TicketPanel(props: PanelProps) {
  const { ticket, onClose, fallbackFocus } = props
  // Keeps the last ticket on screen while the panel slides out
  const [shown, setShown] = useState(ticket)
  if (ticket && ticket !== shown) setShown(ticket)

  const open = ticket !== null
  const panel = useRef<HTMLElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const openId = ticket?.id ?? null
  const lastId = useRef(openId)

  useEffect(() => {
    if (openId) {
      // Opened from the table: announce the ticket by focusing its subject.
      // Switched with the panel's own buttons: leave focus where it is.
      if (!panel.current?.contains(document.activeElement))
        heading.current?.focus()
    } else if (lastId.current) {
      // Closed: back to the subject that opened it
      const row = document.querySelector<HTMLElement>(
        `[data-ticket-id="${lastId.current}"]`,
      )
      if (row) row.focus()
      else fallbackFocus()
    }
    lastId.current = openId
  }, [openId, fallbackFocus])

  return (
    <section
      ref={panel}
      id="ticket-panel"
      aria-label="Ticket details"
      aria-hidden={!open}
      inert={!open}
      onKeyDown={(e) => {
        // Escape in a Select's list (rendered elsewhere in the page) closes
        // only the list, not the panel
        if (e.key === 'Escape' && panel.current?.contains(e.target as Node))
          onClose()
      }}
      className={cn(
        'shrink-0 overflow-hidden bg-background duration-300 ease-out motion-reduce:transition-none max-sm:absolute max-sm:inset-y-0 max-sm:right-0 max-sm:z-20',
        // Pushes the table aside as it widens (on phones it covers it instead).
        // Visible at once when opening, so the heading can take focus; hidden
        // only after closing, so it can't be tabbed to while closed
        open
          ? 'visible w-full border-l transition-[width] sm:w-[26rem]'
          : 'invisible w-0 transition-[width,visibility]',
      )}
    >
      {/* A fixed width inside, so the content doesn't reflow while it widens */}
      <div className="flex h-full w-full flex-col sm:w-[26rem]">
        {shown ? (
          <TicketBody {...props} ticket={shown} headingRef={heading} />
        ) : null}
      </div>
    </section>
  )
}

function TicketBody({
  ticket,
  position,
  onPrevious,
  onNext,
  onClose,
  onChange,
  onReply,
  headingRef,
}: PanelProps & {
  ticket: Ticket
  headingRef: RefObject<HTMLHeadingElement | null>
}) {
  const [reply, setReply] = useState('')
  const [sent, setSent] = useState('')
  // A half-written reply doesn't follow you to the next ticket. (Not a
  // remount by key: that would drop focus from the next/previous buttons.)
  const [replyFor, setReplyFor] = useState(ticket.id)
  if (replyFor !== ticket.id) {
    setReplyFor(ticket.id)
    setReply('')
    setSent('')
  }
  const thread = useRef<HTMLOListElement>(null)

  function send() {
    if (!reply.trim()) return
    onReply(reply)
    setReply('')
    setSent(
      ticket.status === 'open'
        ? 'Reply sent. The ticket is now pending.'
        : 'Reply sent.',
    )
    requestAnimationFrame(() =>
      thread.current?.lastElementChild?.scrollIntoView({ block: 'nearest' }),
    )
  }

  const field = (id: string) => `${ticket.id}-${id}`

  return (
    <>
      <header className="space-y-2 border-b p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono text-xs text-muted-foreground">{ticket.id}</p>
          <div className="flex items-center gap-1">
            <span className="mr-1 text-xs text-muted-foreground tabular-nums">
              {position.index + 1} of {position.total}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label="Previous ticket"
              disabled={!onPrevious}
              onClick={onPrevious}
            >
              <ChevronUp />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label="Next ticket"
              disabled={!onNext}
              onClick={onNext}
            >
              <ChevronDown />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label="Close ticket"
              onClick={onClose}
            >
              <X />
            </Button>
          </div>
        </div>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-base leading-snug font-semibold outline-none"
        >
          {ticket.subject}
        </h2>
        <p className="text-sm text-muted-foreground">
          {ticket.customer.name} · {ticket.customer.company} ·{' '}
          <span className="break-all">{ticket.customer.email}</span>
        </p>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label htmlFor={field('status')} className="text-xs">
              Status
            </Label>
            <Select
              value={ticket.status}
              onValueChange={(status) =>
                onChange({ status: status as Ticket['status'] })
              }
            >
              <SelectTrigger id={field('status')} size="sm" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {statusStyle[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={field('priority')} className="text-xs">
              Priority
            </Label>
            <Select
              value={ticket.priority}
              onValueChange={(priority) =>
                onChange({ priority: priority as Ticket['priority'] })
              }
            >
              <SelectTrigger
                id={field('priority')}
                size="sm"
                className="w-full"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((p) => (
                  <SelectItem key={p} value={p}>
                    <PriorityLabel priority={p} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor={field('assignee')} className="text-xs">
              Assignee
            </Label>
            <Select
              value={ticket.assignee}
              onValueChange={(assignee) =>
                onChange({ assignee: assignee as Ticket['assignee'] })
              }
            >
              <SelectTrigger
                id={field('assignee')}
                size="sm"
                className="w-full"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {agents.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <section aria-label="Conversation" className="space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground">
            Conversation
          </h3>
          <ol ref={thread} className="space-y-3">
            {ticket.messages.map((m, i) => (
              <li key={i} className="flex gap-2.5">
                <span
                  aria-hidden
                  className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-medium',
                    m.from === 'agent'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {initials(m.author)}
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
                    <span className="font-medium">{m.author}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {formatTime(m.at)}
                    </span>
                  </p>
                  <p
                    className={cn(
                      'rounded-md px-3 py-2 text-sm',
                      m.from === 'agent' ? 'bg-muted/60' : 'border',
                    )}
                  >
                    {m.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <form
        className="space-y-2 border-t p-4"
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
      >
        <Label htmlFor={field('reply')} className="sr-only">
          Reply to {ticket.customer.name}
        </Label>
        <textarea
          id={field('reply')}
          value={reply}
          onChange={(e) => {
            setReply(e.target.value)
            setSent('')
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              send()
            }
          }}
          rows={3}
          placeholder={`Reply to ${ticket.customer.name.split(' ')[0]}…`}
          className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
        />
        <div className="flex items-center justify-between gap-2">
          <p aria-live="polite" className="text-xs text-muted-foreground">
            {sent || '⌘ Enter to send'}
          </p>
          <Button type="submit" size="sm" disabled={!reply.trim()}>
            <SendHorizontal /> Send reply
          </Button>
        </div>
      </form>
    </>
  )
}
