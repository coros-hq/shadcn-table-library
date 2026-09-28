import { useState } from 'react'
import type { InventoryTableMeta, SkuRow } from './columns'
import { InventoryTable } from './data-table'
import { allocateFefo } from './formulas'

// Expiry dates are relative to today so the demo always has one expired
// batch and one about to expire, no matter when it's viewed.
function daysFromNow(days: number) {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

const initialData: SkuRow[] = [
  {
    sku: 'SKU-1042',
    name: 'Cold Brew Concentrate 1L',
    casePack: 12,
    orderedQty: 180,
    dailyDemand: 40,
    leadTimeDays: 5,
    safetyStock: 60,
    batches: [
      { id: 'b1', lot: 'L-2291', location: 'WH1 · A-03-2', expiresOn: daysFromNow(9), onHand: 96, allocated: 96 },
      { id: 'b2', lot: 'L-2310', location: 'WH1 · A-04-1', expiresOn: daysFromNow(24), onHand: 144, allocated: 40 },
      { id: 'b3', lot: 'L-2188', location: 'WH2 · C-11-4', expiresOn: daysFromNow(-2), onHand: 24, allocated: 0 },
    ],
  },
  {
    sku: 'SKU-2007',
    name: 'Oat Milk Barista 1L',
    casePack: 6,
    orderedQty: 120,
    dailyDemand: 18,
    leadTimeDays: 4,
    safetyStock: 30,
    batches: [
      { id: 'b1', lot: 'L-5501', location: 'WH1 · B-02-1', expiresOn: daysFromNow(40), onHand: 200, allocated: 120 },
      { id: 'b2', lot: 'L-5540', location: 'WH1 · B-02-3', expiresOn: daysFromNow(55), onHand: 100, allocated: 0 },
    ],
  },
  {
    sku: 'SKU-3310',
    name: 'Nitrile Gloves M (100 ct)',
    casePack: 10,
    orderedQty: 400,
    dailyDemand: 55,
    leadTimeDays: 10,
    safetyStock: 150,
    batches: [
      { id: 'b1', lot: 'L-8812', location: 'WH2 · D-01-1', expiresOn: daysFromNow(400), onHand: 220, allocated: 220 },
      { id: 'b2', lot: 'L-8830', location: 'WH2 · D-01-2', expiresOn: daysFromNow(420), onHand: 60, allocated: 0 },
    ],
  },
  {
    sku: 'SKU-4120',
    name: 'Protein Bar Chocolate 12-pk',
    casePack: 24,
    orderedQty: 90,
    dailyDemand: 30,
    leadTimeDays: 7,
    safetyStock: 40,
    batches: [
      { id: 'b1', lot: 'L-7001', location: 'WH1 · C-05-2', expiresOn: daysFromNow(30), onHand: 150, allocated: 90 },
      { id: 'b2', lot: 'L-7044', location: 'WH1 · C-05-3', expiresOn: daysFromNow(75), onHand: 240, allocated: 0 },
    ],
  },
  {
    sku: 'SKU-5061',
    name: 'Thermal Labels 4×6 (roll)',
    casePack: 50,
    orderedQty: 0,
    dailyDemand: 25,
    leadTimeDays: 14,
    safetyStock: 100,
    batches: [
      { id: 'b1', lot: 'L-9120', location: 'WH2 · E-07-3', expiresOn: daysFromNow(730), onHand: 380, allocated: 0 },
    ],
  },
  {
    sku: 'SKU-6204',
    name: 'Greek Yogurt 500g',
    casePack: 8,
    orderedQty: 64,
    dailyDemand: 22,
    leadTimeDays: 3,
    safetyStock: 20,
    batches: [
      { id: 'b1', lot: 'L-3301', location: 'WH1 · F-02-1', expiresOn: daysFromNow(4), onHand: 40, allocated: 40 },
      { id: 'b2', lot: 'L-3319', location: 'WH1 · F-02-2', expiresOn: daysFromNow(11), onHand: 80, allocated: 0 },
      { id: 'b3', lot: 'L-3290', location: 'WH1 · F-01-4', expiresOn: daysFromNow(-1), onHand: 16, allocated: 0 },
    ],
  },
  {
    sku: 'SKU-7118',
    name: 'Shipping Carton 12×12×8',
    casePack: 25,
    orderedQty: 250,
    dailyDemand: 60,
    leadTimeDays: 6,
    safetyStock: 120,
    batches: [
      { id: 'b1', lot: 'L-4410', location: 'WH2 · G-12-1', expiresOn: daysFromNow(999), onHand: 600, allocated: 250 },
      { id: 'b2', lot: 'L-4455', location: 'WH2 · G-12-2', expiresOn: daysFromNow(999), onHand: 400, allocated: 0 },
    ],
  },
]

export function InventoryAllocationDemo() {
  const [data, setData] = useState(initialData)

  function updateRow(sku: string, update: (row: SkuRow) => SkuRow) {
    setData((prev) => prev.map((row) => (row.sku === sku ? update(row) : row)))
  }

  const meta: InventoryTableMeta = {
    updateSku: (sku, field, value) => updateRow(sku, (row) => ({ ...row, [field]: value })),
    updateBatch: (sku, batchId, allocated) =>
      updateRow(sku, (row) => ({
        ...row,
        batches: row.batches.map((b) => (b.id === batchId ? { ...b, allocated } : b)),
      })),
    autoAllocate: (sku) => updateRow(sku, (row) => ({ ...row, batches: allocateFefo(row) })),
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Click a demand, lead-time, or safety-stock value to edit it — every derived column
        recalculates. Expand a SKU to reallocate its batches.
      </p>
      <InventoryTable data={data} meta={meta} />
    </div>
  )
}
