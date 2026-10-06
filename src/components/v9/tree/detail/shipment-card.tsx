'use client'

import { useEffect, useRef } from 'react'
import { Package, X } from 'lucide-react'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils.ts'
import { day, statusStyle } from './columns'
import type { Order, Shipment } from './data'

const stamp = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
})

interface ShipmentCardProps {
  open: boolean
  onClose: () => void
  // Null until the first shipment is opened; the card is mounted from the
  // start so its first slide-in can animate
  shipment: Shipment | null
  order: Order | null
}

export function ShipmentCard({
  open,
  onClose,
  shipment,
  order,
}: ShipmentCardProps) {
  const cardRef = useRef<HTMLElement>(null)

  // Move focus into the card when it opens or switches shipment
  useEffect(() => {
    if (open) cardRef.current?.focus({ preventScroll: true })
  }, [open, shipment?.id])

  const details: Array<[string, string]> = shipment
    ? [
        ['Destination', shipment.address],
        ['Items', String(shipment.items)],
        ['Weight', `${shipment.weightKg} kg`],
        ['Estimated delivery', day.format(new Date(shipment.eta))],
      ]
    : []

  return (
    // The wrapper animates its width (or slides over the table on phones); the
    // card inside keeps a fixed width so its content never reflows mid-slide
    <div
      className={cn(
        'absolute inset-y-0 right-0 z-10 w-full overflow-hidden bg-background',
        'transition-[transform,width] duration-300 ease-out motion-reduce:transition-none',
        'sm:relative sm:z-auto sm:shrink-0',
        open
          ? 'translate-x-0 sm:w-88'
          : 'translate-x-full sm:translate-x-0 sm:w-0',
      )}
    >
      <aside
        ref={cardRef}
        tabIndex={-1}
        aria-label="Shipment details"
        // inert keeps the hidden card out of the tab order and the accessibility tree
        inert={!open}
        className="absolute inset-y-0 right-0 w-full overflow-y-auto border-l outline-none sm:w-88"
      >
        {shipment && order && (
          <>
            <div className="space-y-3 border-b p-5 pr-12">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Close details"
                onClick={onClose}
                className="absolute top-3 right-3 size-7"
              >
                <X className="size-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                  <Package className="size-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base leading-none font-semibold">
                    {shipment.carrier} shipment
                  </h3>
                  <p className="mt-1.5 truncate font-mono text-xs text-muted-foreground">
                    {shipment.tracking}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge
                  variant="secondary"
                  className={statusStyle[shipment.status]}
                >
                  {shipment.status}
                </Badge>
                <span className="text-muted-foreground">
                  for order {order.number} · {order.customer}
                </span>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-4 border-b p-5 text-sm">
              {details.map(([label, value], i) => (
                <div key={label} className={cn(i === 0 && 'col-span-2')}>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="mt-0.5">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="p-5">
              <p className="mb-3 text-sm font-medium">Tracking history</p>
              <ol className="space-y-4">
                {[...shipment.events].reverse().map((event, i) => (
                  <li key={event.at} className="flex gap-3 text-sm">
                    <span
                      aria-hidden
                      className={cn(
                        'mt-1.5 size-2 shrink-0 rounded-full',
                        i === 0 ? 'bg-primary' : 'bg-muted-foreground/40',
                      )}
                    />
                    <div>
                      <p className={cn(i === 0 && 'font-medium')}>
                        {event.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {event.location} · {stamp.format(new Date(event.at))}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
