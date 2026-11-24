<script lang="ts">
  import { tick } from 'svelte'
  import Package from '@lucide/svelte/icons/package'
  import X from '@lucide/svelte/icons/x'
  import { Badge } from '$lib/components/ui/badge/index.js'
  import { Button } from '$lib/components/ui/button/index.js'
  import { cn } from '$lib/utils.js'
  import { day, statusStyle } from './columns'
  import type { Order, Shipment } from './data'

  const stamp = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  })

  // shipment and order are null until the first shipment is opened; the card is
  // mounted from the start so its first slide-in can animate
  type Props = {
    open: boolean
    shipment: Shipment | null
    order: Order | null
    onclose?: () => void
  }

  let { open, shipment, order, onclose }: Props = $props()

  let cardRef = $state<HTMLElement | null>(null)

  // Move focus into the card when it opens or switches shipment
  $effect(() => {
    void shipment?.id
    if (!open) return
    tick().then(() => cardRef?.focus({ preventScroll: true }))
  })

  const details = $derived<Array<[string, string]>>(
    shipment
      ? [
          ['Destination', shipment.address],
          ['Items', String(shipment.items)],
          ['Weight', `${shipment.weightKg} kg`],
          ['Estimated delivery', day.format(new Date(shipment.eta))],
        ]
      : [],
  )
</script>

<!-- The wrapper animates its width (or slides over the table on phones); the
     card inside keeps a fixed width so its content never reflows mid-slide -->
<div
  class={cn(
    'absolute inset-y-0 right-0 z-10 w-full overflow-hidden bg-background',
    'transition-[transform,width] duration-300 ease-out motion-reduce:transition-none',
    'sm:relative sm:z-auto sm:shrink-0',
    open ? 'translate-x-0 sm:w-88' : 'translate-x-full sm:translate-x-0 sm:w-0',
  )}
>
  <!-- inert keeps the hidden card out of the tab order and the accessibility tree -->
  <aside
    bind:this={cardRef}
    tabindex="-1"
    aria-label="Shipment details"
    inert={!open}
    class="absolute inset-y-0 right-0 w-full overflow-y-auto border-l outline-none sm:w-88"
  >
    {#if shipment && order}
      <div class="space-y-3 border-b p-5 pr-12">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Close details"
          class="absolute top-3 right-3 size-7"
          onclick={() => onclose?.()}
        >
          <X class="size-4" />
        </Button>
        <div class="flex items-center gap-3">
          <div class="flex size-10 items-center justify-center rounded-lg bg-muted">
            <Package class="size-5" />
          </div>
          <div class="min-w-0">
            <h3 class="text-base leading-none font-semibold">
              {shipment.carrier} shipment
            </h3>
            <p class="mt-1.5 truncate font-mono text-xs text-muted-foreground">
              {shipment.tracking}
            </p>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2 text-sm">
          <Badge variant="secondary" class={statusStyle[shipment.status]}>
            {shipment.status}
          </Badge>
          <span class="text-muted-foreground">
            for order {order.number} · {order.customer}
          </span>
        </div>
      </div>

      <dl class="grid grid-cols-2 gap-x-4 gap-y-4 border-b p-5 text-sm">
        {#each details as [label, value], i (label)}
          <div class={cn(i === 0 && 'col-span-2')}>
            <dt class="text-xs text-muted-foreground">{label}</dt>
            <dd class="mt-0.5">{value}</dd>
          </div>
        {/each}
      </dl>

      <div class="p-5">
        <p class="mb-3 text-sm font-medium">Tracking history</p>
        <ol class="space-y-4">
          {#each [...shipment.events].reverse() as event, i (event.at)}
            <li class="flex gap-3 text-sm">
              <span
                aria-hidden="true"
                class={cn(
                  'mt-1.5 size-2 shrink-0 rounded-full',
                  i === 0 ? 'bg-primary' : 'bg-muted-foreground/40',
                )}
              ></span>
              <div>
                <p class={cn(i === 0 && 'font-medium')}>{event.label}</p>
                <p class="text-xs text-muted-foreground">
                  {event.location} · {stamp.format(new Date(event.at))}
                </p>
              </div>
            </li>
          {/each}
        </ol>
      </div>
    {/if}
  </aside>
</div>
