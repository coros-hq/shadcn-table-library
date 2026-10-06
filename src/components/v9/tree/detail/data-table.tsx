'use client'

import { useState } from 'react'
import { flexRender, useTable } from '@tanstack/react-table-v9'
import type { ColumnDef, ExpandedState, Row } from '@tanstack/react-table-v9'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { cn } from '#/lib/utils.ts'
import { v9Features } from '#/lib/table-v9-features.ts'
import type { V9Features } from '#/lib/table-v9-features.ts'
import { ShipmentCard } from './shipment-card'
import type { Order, Shipment, TreeRow } from './data'

// The card takes this room from the table; its header repeats these values
const hiddenWhileOpen = { details: false, amount: false, date: false }

interface DetailPanelTableProps {
  columns: ColumnDef<V9Features, TreeRow, any>[]
  data: Order[]
}

export function DetailPanelTable({ columns, data }: DetailPanelTableProps) {
  const [expanded, setExpanded] = useState<ExpandedState>(true)
  // Kept after closing so the card keeps its content while it slides out
  const [panel, setPanel] = useState<{
    shipment: Shipment
    order: Order
    trigger: HTMLElement
    open: boolean
  } | null>(null)

  const table = useTable({
    features: v9Features,
    // v9Features registers pagination, which would cut open groups off at 10 rows
    manualPagination: true,
    data,
    columns,
    getRowId: (row) => row.id,
    getSubRows: (row) => (row.kind === 'order' ? row.children : undefined),
    onExpandedChange: setExpanded,
    state: { expanded, columnVisibility: panel?.open ? hiddenWhileOpen : {} },
  })

  function openShipment(row: Row<V9Features, TreeRow>, trigger: HTMLElement) {
    const shipment = row.original
    const order = row.getParentRow()?.original
    if (shipment.kind !== 'shipment' || order?.kind !== 'order') return
    setPanel({ shipment, order, trigger, open: true })
  }

  function closePanel() {
    if (!panel) return
    setPanel({ ...panel, open: false })
    // The card is inert once closed, so hand focus back to the row that opened it
    panel.trigger.focus()
  }

  return (
    // The card is docked inside this box and pushes the table aside as it opens
    <div
      className="relative flex min-h-[36rem] overflow-hidden rounded-md border"
      onKeyDown={(e) => {
        if (e.key === 'Escape' && panel?.open) closePanel()
      }}
    >
      <div className="min-w-0 flex-1 overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.column.columnDef.size }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => {
              const isShipment = row.original.kind === 'shipment'
              const isOpen =
                isShipment &&
                panel?.open === true &&
                panel.shipment.id === row.id
              return (
                <TableRow
                  key={row.id}
                  tabIndex={isShipment ? 0 : undefined}
                  data-state={isOpen ? 'selected' : undefined}
                  onClick={
                    isShipment
                      ? (e) => openShipment(row, e.currentTarget)
                      : undefined
                  }
                  onKeyDown={
                    isShipment
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            openShipment(row, e.currentTarget)
                          }
                        }
                      : undefined
                  }
                  className={cn(
                    isShipment &&
                      'cursor-pointer bg-muted/30 outline-none focus-visible:bg-muted',
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <ShipmentCard
        open={panel?.open === true}
        onClose={closePanel}
        shipment={panel?.shipment ?? null}
        order={panel?.order ?? null}
      />
    </div>
  )
}
