<script lang="ts">
  import { tick } from 'svelte'
  import ChevronDown from '@lucide/svelte/icons/chevron-down'
  import ChevronUp from '@lucide/svelte/icons/chevron-up'
  import SendHorizontal from '@lucide/svelte/icons/send-horizontal'
  import X from '@lucide/svelte/icons/x'
  import { Button } from '$lib/components/ui/button/index.js'
  import { Label } from '$lib/components/ui/label/index.js'
  import * as Select from '$lib/components/ui/select/index.js'
  import { cn } from '$lib/utils.js'
  import { agents, priorities, statuses } from './data'
  import type { Ticket } from './data'
  import PriorityLabel from './PriorityLabel.svelte'
  import { priorityStyle, statusStyle } from './styles'
  import { formatTime, initials } from './tickets'
  import type { Changes } from './tickets'

  type Props = {
    /** The ticket to show, or null when the panel is closed */
    ticket: Ticket | null
    /** "3 of 9" in the current filter and sort */
    position: { index: number; total: number }
    onprevious?: () => void
    onnext?: () => void
    onclose: () => void
    onchange: (changes: Changes) => void
    onreply: (body: string) => void
    /** Where focus goes on close when the ticket's row is gone */
    fallbackFocus: () => void
  }

  let {
    ticket,
    position,
    onprevious,
    onnext,
    onclose,
    onchange,
    onreply,
    fallbackFocus,
  }: Props = $props()

  // Keeps the last ticket on screen while the panel slides out
  let shown = $state.raw<Ticket | null>(null)
  $effect.pre(() => {
    if (ticket) shown = ticket
  })

  const open = $derived(ticket !== null)
  let panel = $state<HTMLElement>()
  let heading = $state<HTMLElement>()

  let lastId: string | null = null
  $effect(() => {
    const openId = ticket?.id ?? null
    if (openId === lastId) return
    const previous = lastId
    lastId = openId
    tick().then(() => {
      if (openId) {
        // Opened from the table: announce the ticket by focusing its
        // subject. Switched with the panel's own buttons: leave focus there.
        if (!panel?.contains(document.activeElement)) heading?.focus()
      } else if (previous) {
        // Closed: back to the subject that opened it
        const row = document.querySelector<HTMLElement>(
          `[data-ticket-id="${previous}"]`,
        )
        if (row) row.focus()
        else fallbackFocus()
      }
    })
  })

  // A half-written reply doesn't follow you to the next ticket
  let reply = $state('')
  let sent = $state('')
  let replyFor: string | undefined
  $effect.pre(() => {
    if (shown?.id !== replyFor) {
      replyFor = shown?.id
      reply = ''
      sent = ''
    }
  })

  let thread = $state<HTMLElement>()
  async function send() {
    if (!shown || !reply.trim()) return
    onreply(reply)
    sent =
      shown.status === 'open'
        ? 'Reply sent. The ticket is now pending.'
        : 'Reply sent.'
    reply = ''
    await tick()
    thread?.lastElementChild?.scrollIntoView({ block: 'nearest' })
  }

  function onkeydown(e: KeyboardEvent) {
    // Escape in a Select's list (rendered elsewhere in the page) closes only
    // the list, not the panel
    if (e.key === 'Escape' && panel?.contains(e.target as Node)) onclose()
  }

  const field = (id: string) => `${shown?.id}-${id}`
</script>

<section
  bind:this={panel}
  id="ticket-panel"
  aria-label="Ticket details"
  aria-hidden={!open}
  inert={!open}
  {onkeydown}
  class={cn(
    'shrink-0 overflow-hidden bg-background duration-300 ease-out motion-reduce:transition-none max-sm:absolute max-sm:inset-y-0 max-sm:right-0 max-sm:z-20',
    // Pushes the table aside as it widens (on phones it covers it instead).
    // Visible at once when opening, so the heading can take focus; hidden
    // only after closing, so it can't be tabbed to while closed
    open
      ? 'visible w-full border-l transition-[width] sm:w-[26rem]'
      : 'invisible w-0 transition-[width,visibility]',
  )}
>
  {#if shown}
    <!-- A fixed width inside, so the content doesn't reflow while it widens -->
    <div class="flex h-full w-full flex-col sm:w-[26rem]">
      <header class="space-y-2 border-b p-4">
        <div class="flex items-center justify-between gap-2">
          <p class="font-mono text-xs text-muted-foreground">{shown.id}</p>
          <div class="flex items-center gap-1">
            <span class="mr-1 text-xs text-muted-foreground tabular-nums">
              {position.index + 1} of {position.total}
            </span>
            <Button
              variant="ghost"
              size="icon"
              class="size-7"
              aria-label="Previous ticket"
              disabled={!onprevious}
              onclick={onprevious}
            >
              <ChevronUp />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              class="size-7"
              aria-label="Next ticket"
              disabled={!onnext}
              onclick={onnext}
            >
              <ChevronDown />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              class="size-7"
              aria-label="Close ticket"
              onclick={onclose}
            >
              <X />
            </Button>
          </div>
        </div>
        <h2
          bind:this={heading}
          tabindex="-1"
          class="text-base leading-snug font-semibold outline-none"
        >
          {shown.subject}
        </h2>
        <p class="text-sm text-muted-foreground">
          {shown.customer.name} · {shown.customer.company} ·
          <span class="break-all">{shown.customer.email}</span>
        </p>
      </header>

      <div class="flex-1 space-y-5 overflow-y-auto p-4">
        <div class="grid grid-cols-2 gap-2">
          <div class="space-y-1.5">
            <Label for={field('status')} class="text-xs">Status</Label>
            <Select.Root
              type="single"
              value={shown.status}
              onValueChange={(v) => onchange({ status: v as Ticket['status'] })}
            >
              <Select.Trigger id={field('status')} class="h-8 w-full">
                {statusStyle[shown.status].label}
              </Select.Trigger>
              <Select.Content>
                {#each statuses as s (s)}
                  <Select.Item value={s} label={statusStyle[s].label} />
                {/each}
              </Select.Content>
            </Select.Root>
          </div>
          <div class="space-y-1.5">
            <Label for={field('priority')} class="text-xs">Priority</Label>
            <Select.Root
              type="single"
              value={shown.priority}
              onValueChange={(v) =>
                onchange({ priority: v as Ticket['priority'] })}
            >
              <Select.Trigger id={field('priority')} class="h-8 w-full">
                <PriorityLabel priority={shown.priority} />
              </Select.Trigger>
              <Select.Content>
                {#each priorities as p (p)}
                  <Select.Item value={p} label={priorityStyle[p].label}>
                    <PriorityLabel priority={p} />
                  </Select.Item>
                {/each}
              </Select.Content>
            </Select.Root>
          </div>
          <div class="col-span-2 space-y-1.5">
            <Label for={field('assignee')} class="text-xs">Assignee</Label>
            <Select.Root
              type="single"
              value={shown.assignee}
              onValueChange={(v) =>
                onchange({ assignee: v as Ticket['assignee'] })}
            >
              <Select.Trigger id={field('assignee')} class="h-8 w-full">
                {shown.assignee}
              </Select.Trigger>
              <Select.Content>
                {#each agents as a (a)}
                  <Select.Item value={a} label={a} />
                {/each}
              </Select.Content>
            </Select.Root>
          </div>
        </div>

        <section aria-label="Conversation" class="space-y-3">
          <h3 class="text-xs font-medium text-muted-foreground">
            Conversation
          </h3>
          <ol bind:this={thread} class="space-y-3">
            {#each shown.messages as m, i (i)}
              <li class="flex gap-2.5">
                <span
                  aria-hidden="true"
                  class={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-medium',
                    m.from === 'agent'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {initials(m.author)}
                </span>
                <div class="min-w-0 flex-1 space-y-1">
                  <p class="flex flex-wrap items-baseline gap-x-2 text-sm">
                    <span class="font-medium">{m.author}</span>
                    <span class="text-xs text-muted-foreground tabular-nums">
                      {formatTime(m.at)}
                    </span>
                  </p>
                  <p
                    class={cn(
                      'rounded-md px-3 py-2 text-sm',
                      m.from === 'agent' ? 'bg-muted/60' : 'border',
                    )}
                  >
                    {m.body}
                  </p>
                </div>
              </li>
            {/each}
          </ol>
        </section>
      </div>

      <form
        class="space-y-2 border-t p-4"
        onsubmit={(e) => {
          e.preventDefault()
          send()
        }}
      >
        <Label for={field('reply')} class="sr-only">
          Reply to {shown.customer.name}
        </Label>
        <textarea
          id={field('reply')}
          bind:value={reply}
          rows="3"
          placeholder="Reply to {shown.customer.name.split(' ')[0]}…"
          class="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
          oninput={() => (sent = '')}
          onkeydown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              send()
            }
          }}
        ></textarea>
        <div class="flex items-center justify-between gap-2">
          <p aria-live="polite" class="text-xs text-muted-foreground">
            {sent || '⌘ Enter to send'}
          </p>
          <Button type="submit" size="sm" disabled={!reply.trim()}>
            <SendHorizontal /> Send reply
          </Button>
        </div>
      </form>
    </div>
  {/if}
</section>
