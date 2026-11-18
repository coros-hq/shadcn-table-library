<script lang="ts">
  import type { Ticket } from './data'
  import type { View } from './tickets'
  import { inView } from './tickets'

  // The subject opens the ticket in the panel
  type Props = {
    ticket: Ticket
    isOpen: boolean
    view: View
    onopen: () => void
  }

  let { ticket, isOpen, view, onopen }: Props = $props()
</script>

<div class="flex min-w-0 flex-col gap-0.5">
  <button
    type="button"
    data-ticket-id={ticket.id}
    aria-expanded={isOpen}
    aria-controls="ticket-panel"
    onclick={onopen}
    class="truncate rounded-sm text-left font-medium outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
  >
    {ticket.subject}
  </button>
  <span class="truncate text-xs text-muted-foreground">
    <span class="font-mono">{ticket.id}</span> · {ticket.customer.name},
    {ticket.customer.company}
  </span>
  {#if isOpen && !inView(ticket, view)}
    <span class="text-xs text-amber-700 dark:text-amber-400">
      No longer {view}: leaves this list when you close it
    </span>
  {/if}
</div>
