import type { ColumnDef, Table } from '@tanstack/table-core'
import { renderComponent } from '$lib/components/ui/data-table/index.js'
import { actions, resourceGroups } from './data'
import type { Action, Grants, Resource } from './data'
import PermissionCheckbox from './PermissionCheckbox.svelte'
import ResourceCell from './ResourceCell.svelte'
import SummaryCheckbox from './SummaryCheckbox.svelte'
import { cellState, key, summarize } from './permissions'
import type { Cell } from './permissions'

/** A group of resources, or one resource. Both carry the resources they cover. */
export interface MatrixRow {
  id: string
  name: string
  description?: string
  resources: Resource[]
  subRows?: MatrixRow[]
}

export const rows: MatrixRow[] = resourceGroups.map((group) => ({
  id: group.id,
  name: group.name,
  resources: group.resources,
  subRows: group.resources.map((resource) => ({
    id: `${group.id}/${resource.id}`,
    name: resource.name,
    description: resource.description,
    resources: [resource],
  })),
}))

const allResources = resourceGroups.flatMap((g) => g.resources)

export interface MatrixMeta {
  roleId: string
  grants: Grants
  /** `role:resource.action` keys that differ from the last save */
  changed: Set<string>
  setCells: (cells: Cell[], on: boolean) => void
}

const getMeta = (table: Table<MatrixRow>) =>
  table.options.meta as unknown as MatrixMeta

export const cellsFor = (
  resources: Resource[],
  only: readonly Action[] = actions.map((a) => a.id),
): Cell[] =>
  resources.flatMap((resource) => only.map((action) => ({ resource, action })))

const summaryHeader =
  (heading: string, cells: Cell[], label: string) =>
  ({ table }: { table: Table<MatrixRow> }) => {
    const meta = getMeta(table)
    return renderComponent(SummaryCheckbox, {
      heading,
      label,
      summary: summarize(meta.roleId, cells, meta.grants),
      onchange: (on: boolean) => meta.setCells(cells, on),
    })
  }

export const columns: ColumnDef<MatrixRow>[] = [
  {
    id: 'resource',
    header: 'Resource',
    cell: ({ row }) =>
      renderComponent(ResourceCell, {
        name: row.original.name,
        description: row.original.description,
        count: row.original.resources.length,
        expanded: row.getIsExpanded(),
        onToggle: row.getCanExpand() ? () => row.toggleExpanded() : undefined,
      }),
  },
  ...actions.map(({ id: action, label }): ColumnDef<MatrixRow> => ({
    id: action,
    header: summaryHeader(
      label,
      cellsFor(allResources, [action]),
      `${label} on every resource`,
    ),
    cell: ({ row, table }) => {
      const meta = getMeta(table)
      const { resources, name } = row.original
      if (row.getCanExpand()) {
        const cells = cellsFor(
          resources.filter((r) => r.actions.includes(action)),
          [action],
        )
        if (!cells.length) return null
        return renderComponent(SummaryCheckbox, {
          summary: summarize(meta.roleId, cells, meta.grants),
          label: `${label} on every ${name} resource`,
          onchange: (on: boolean) => meta.setCells(cells, on),
        })
      }
      const cell = { resource: resources[0], action }
      return renderComponent(PermissionCheckbox, {
        state: cellState(meta.roleId, cell, meta.grants),
        label: `${label} ${name}`,
        changed: meta.changed.has(
          `${meta.roleId}:${key(resources[0].id, action)}`,
        ),
        onchange: (on: boolean) => meta.setCells([cell], on),
      })
    },
  })),
  {
    id: 'all',
    header: summaryHeader('All', cellsFor(allResources), 'Every permission'),
    cell: ({ row, table }) => {
      const meta = getMeta(table)
      const cells = cellsFor(row.original.resources)
      return renderComponent(SummaryCheckbox, {
        summary: summarize(meta.roleId, cells, meta.grants),
        label: `Every permission on ${row.original.name}`,
        onchange: (on: boolean) => meta.setCells(cells, on),
      })
    },
  },
]
