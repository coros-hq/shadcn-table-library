import type { Batch, SkuRow } from './columns'

export type StockStatus = 'Short' | 'Reorder' | 'Healthy'

export interface SkuMetrics {
  onHand: number
  allocated: number
  /** On hand minus what's already promised to orders. */
  available: number
  /** Open order demand not yet covered by an allocation. */
  unallocated: number
  /** dailyDemand × leadTimeDays + safetyStock */
  reorderPoint: number
  /** Available stock net of unallocated demand — what reorders are judged on. */
  position: number
  daysOfCover: number
  /** Rounded up to whole case packs so the suggestion is actually orderable. */
  reorderQty: number
  status: StockStatus
}

export function isExpired(batch: Batch, today = new Date()) {
  return new Date(batch.expiresOn) < today
}

/**
 * Every derived number in the grid comes from here. Nothing computed is ever
 * stored on the row, so editing one input (a batch allocation, a lead time)
 * can't leave a stale total somewhere else — the next render recomputes all
 * of it from the raw values.
 */
export function deriveMetrics(row: SkuRow): SkuMetrics {
  const usable = row.batches.filter((b) => !isExpired(b))
  const onHand = usable.reduce((sum, b) => sum + b.onHand, 0)
  const allocated = row.batches.reduce((sum, b) => sum + b.allocated, 0)
  const available = onHand - allocated
  const unallocated = Math.max(0, row.orderedQty - allocated)
  const reorderPoint = row.dailyDemand * row.leadTimeDays + row.safetyStock
  const position = available - unallocated
  const daysOfCover =
    row.dailyDemand > 0 ? Math.max(0, position) / row.dailyDemand : Infinity
  const shortfall = Math.max(0, reorderPoint - position)
  const reorderQty = Math.ceil(shortfall / row.casePack) * row.casePack

  const status: StockStatus =
    unallocated > available
      ? 'Short'
      : position < reorderPoint
        ? 'Reorder'
        : 'Healthy'

  return {
    onHand,
    allocated,
    available,
    unallocated,
    reorderPoint,
    position,
    daysOfCover,
    reorderQty,
    status,
  }
}

/**
 * First-expired, first-out: fill the SKU's open order demand from the
 * batch that expires soonest, skipping expired stock entirely. Existing
 * allocations are replaced, not added to.
 */
export function allocateFefo(row: SkuRow): Batch[] {
  let remaining = row.orderedQty
  const order = [...row.batches]
    .filter((b) => !isExpired(b))
    .sort((a, b) => a.expiresOn.localeCompare(b.expiresOn))
    .map((b) => b.id)

  const allocations = new Map<string, number>()
  for (const id of order) {
    const batch = row.batches.find((b) => b.id === id)!
    const take = Math.min(batch.onHand, remaining)
    allocations.set(id, take)
    remaining -= take
  }

  return row.batches.map((b) => ({ ...b, allocated: allocations.get(b.id) ?? 0 }))
}
