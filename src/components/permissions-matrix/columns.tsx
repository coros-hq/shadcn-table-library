import { ChevronRight } from 'lucide-react'
import type { ColumnDef, Table } from '@tanstack/react-table'

import { cn } from '#/lib/utils'
import { actions, resourceGroups } from './data'
import type { Action, Grants, Resource } from './data'
import { PermissionCheckbox, SummaryCheckbox } from './permission-checkbox'
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

export const columns: ColumnDef<MatrixRow>[] = [
  {
    id: 'resource',
    header: 'Resource',
    cell: ({ row }) =>
      row.getCanExpand() ? (
        <button
          type="button"
          onClick={row.getToggleExpandedHandler()}
          aria-expanded={row.getIsExpanded()}
          className="flex items-center gap-1.5 rounded-sm text-left font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <ChevronRight
            className={cn(
              'size-4 text-muted-foreground transition-transform',
              row.getIsExpanded() && 'rotate-90',
            )}
          />
          {row.original.name}
          <span className="font-normal text-muted-foreground">
            {row.original.resources.length}
          </span>
        </button>
      ) : (
        <div className="flex min-w-0 flex-col pl-5.5">
          <span className="truncate">{row.original.name}</span>
          <span className="truncate text-xs text-muted-foreground">
            {row.original.description}
          </span>
        </div>
      ),
  },
  ...actions.map(({ id: action, label }): ColumnDef<MatrixRow> => ({
    id: action,
    header: ({ table }) => {
      const meta = getMeta(table)
      const cells = cellsFor(allResources, [action])
      return (
        <div className="flex flex-col items-center gap-1.5">
          <span>{label}</span>
          <SummaryCheckbox
            summary={summarize(meta.roleId, cells, meta.grants)}
            label={`${label} on every resource`}
            onChange={(on) => meta.setCells(cells, on)}
          />
        </div>
      )
    },
    cell: ({ row, table }) => {
      const meta = getMeta(table)
      const { resources, name } = row.original
      if (row.getCanExpand()) {
        const cells = cellsFor(
          resources.filter((r) => r.actions.includes(action)),
          [action],
        )
        if (!cells.length) return null
        return (
          <SummaryCheckbox
            summary={summarize(meta.roleId, cells, meta.grants)}
            label={`${label} on every ${name} resource`}
            onChange={(on) => meta.setCells(cells, on)}
          />
        )
      }
      const cell = { resource: resources[0], action }
      return (
        <PermissionCheckbox
          state={cellState(meta.roleId, cell, meta.grants)}
          label={`${label} ${name}`}
          changed={meta.changed.has(
            `${meta.roleId}:${key(resources[0].id, action)}`,
          )}
          onChange={(on) => meta.setCells([cell], on)}
        />
      )
    },
  })),
  {
    id: 'all',
    header: ({ table }) => {
      const meta = getMeta(table)
      const cells = cellsFor(allResources)
      return (
        <div className="flex flex-col items-center gap-1.5">
          <span>All</span>
          <SummaryCheckbox
            summary={summarize(meta.roleId, cells, meta.grants)}
            label="Every permission"
            onChange={(on) => meta.setCells(cells, on)}
          />
        </div>
      )
    },
    cell: ({ row, table }) => {
      const meta = getMeta(table)
      const cells = cellsFor(row.original.resources)
      return (
        <SummaryCheckbox
          summary={summarize(meta.roleId, cells, meta.grants)}
          label={`Every permission on ${row.original.name}`}
          onChange={(on) => meta.setCells(cells, on)}
        />
      )
    },
  },
]
