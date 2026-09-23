'use client'

import { Wand2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils.ts'
import type { InventoryTableMeta, SkuRow } from './columns'
import { EditableNumberCell } from './editable-cell'
import { deriveMetrics, isExpired } from './formulas'

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })

interface BatchDetailProps {
  row: SkuRow
  meta: InventoryTableMeta
}

export function BatchDetail({ row, meta }: BatchDetailProps) {
  const { allocated, unallocated } = deriveMetrics(row)
  const earliestUsable = [...row.batches]
    .filter((b) => !isExpired(b))
    .sort((a, b) => a.expiresOn.localeCompare(b.expiresOn))[0]?.id

  // The detail cell spans every column of a wide, horizontally scrolling
  // grid — cap the panel's width and pin it left so it stays readable and
  // in view however far the master table is scrolled.
  return (
    <div className="sticky left-4 max-w-2xl space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{row.orderedQty.toLocaleString()}</span>{' '}
          units on open orders ·{' '}
          <span className="font-medium text-foreground">{allocated.toLocaleString()}</span>{' '}
          allocated
          {unallocated > 0 ? (
            <>
              {' '}
              ·{' '}
              <span className="font-medium text-amber-700 dark:text-amber-400">
                {unallocated.toLocaleString()} still open
              </span>
            </>
          ) : null}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => meta.autoAllocate(row.sku)}
        >
          <Wand2 className="size-3.5" />
          Auto-allocate (FEFO)
        </Button>
      </div>

      <div className="overflow-hidden rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lot</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="text-right">On hand</TableHead>
              <TableHead>Allocated</TableHead>
              <TableHead className="text-right">Free</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {row.batches.map((batch) => {
              const expired = isExpired(batch)
              // Everything allocated to this SKU except this batch — the
              // ceiling for a new value here is whatever's left of orderedQty.
              const allocatedElsewhere = allocated - batch.allocated
              return (
                <TableRow key={batch.id} className={cn(expired && 'text-muted-foreground')}>
                  <TableCell className="font-mono text-xs">{batch.lot}</TableCell>
                  <TableCell>{batch.location}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2 whitespace-nowrap">
                      {formatDate(batch.expiresOn)}
                      {expired ? (
                        <Badge variant="outline" className="border-transparent bg-destructive/15 text-destructive dark:text-red-300">
                          Expired
                        </Badge>
                      ) : batch.id === earliestUsable ? (
                        <Badge variant="outline">Pick first</Badge>
                      ) : null}
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {batch.onHand.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <EditableNumberCell
                      label={`Allocated from lot ${batch.lot}`}
                      value={batch.allocated}
                      disabled={expired}
                      validate={(n) => {
                        if (n > batch.onHand) return `Only ${batch.onHand} on hand`
                        if (allocatedElsewhere + n > row.orderedQty) {
                          return `Max ${row.orderedQty - allocatedElsewhere} — order is ${row.orderedQty}`
                        }
                        return null
                      }}
                      onCommit={(n) => meta.updateBatch(row.sku, batch.id, n)}
                    />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {expired ? '—' : (batch.onHand - batch.allocated).toLocaleString()}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
