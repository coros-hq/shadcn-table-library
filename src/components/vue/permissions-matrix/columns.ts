import { h } from 'vue'
import type { ColumnDef, Table } from '@tanstack/vue-table'
import { ChevronRight } from '@lucide/vue'

import { cn } from '@/lib/utils'
import { actions, resourceGroups } from './data'
import type { Action, Grants, Resource } from './data'
import PermissionCheckbox from './PermissionCheckbox.vue'
import SummaryCheckbox from './SummaryCheckbox.vue'
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
  (label: string, cells: Cell[], aria: string) =>
  ({ table }: { table: Table<MatrixRow> }) => {
    const meta = getMeta(table)
    return h('div', { class: 'flex flex-col items-center gap-1.5' }, [
      h('span', label),
      h(SummaryCheckbox, {
        summary: summarize(meta.roleId, cells, meta.grants),
        label: aria,
        onChange: (on: boolean) => meta.setCells(cells, on),
      }),
    ])
  }

export const columns: ColumnDef<MatrixRow>[] = [
  {
    id: 'resource',
    header: 'Resource',
    cell: ({ row }) =>
      row.getCanExpand()
        ? h(
            'button',
            {
              type: 'button',
              onClick: row.getToggleExpandedHandler(),
              'aria-expanded': row.getIsExpanded(),
              class:
                'flex items-center gap-1.5 rounded-sm text-left font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
            },
            [
              h(ChevronRight, {
                class: cn(
                  'size-4 text-muted-foreground transition-transform',
                  row.getIsExpanded() && 'rotate-90',
                ),
              }),
              row.original.name,
              h(
                'span',
                { class: 'font-normal text-muted-foreground' },
                String(row.original.resources.length),
              ),
            ],
          )
        : h('div', { class: 'flex min-w-0 flex-col pl-5.5' }, [
            h('span', { class: 'truncate' }, row.original.name),
            h(
              'span',
              { class: 'truncate text-xs text-muted-foreground' },
              row.original.description,
            ),
          ]),
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
        return h(SummaryCheckbox, {
          summary: summarize(meta.roleId, cells, meta.grants),
          label: `${label} on every ${name} resource`,
          onChange: (on: boolean) => meta.setCells(cells, on),
        })
      }
      const cell = { resource: resources[0], action }
      return h(PermissionCheckbox, {
        state: cellState(meta.roleId, cell, meta.grants),
        label: `${label} ${name}`,
        changed: meta.changed.has(
          `${meta.roleId}:${key(resources[0].id, action)}`,
        ),
        onChange: (on: boolean) => meta.setCells([cell], on),
      })
    },
  })),
  {
    id: 'all',
    header: summaryHeader('All', cellsFor(allResources), 'Every permission'),
    cell: ({ row, table }) => {
      const meta = getMeta(table)
      const cells = cellsFor(row.original.resources)
      return h(SummaryCheckbox, {
        summary: summarize(meta.roleId, cells, meta.grants),
        label: `Every permission on ${row.original.name}`,
        onChange: (on: boolean) => meta.setCells(cells, on),
      })
    },
  },
]
