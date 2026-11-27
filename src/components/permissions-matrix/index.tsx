import { useMemo, useState } from 'react'
import { Lock } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import { cn } from '#/lib/utils'
import { initialGrants, resourceGroups, roles } from './data'
import type { Grants } from './data'
import { PermissionsTable } from './data-table'
import { cellsFor } from './columns'
import { cellState, changes, getRole, isOn, setCells } from './permissions'

const allCells = cellsFor(resourceGroups.flatMap((g) => g.resources))

export function PermissionsMatrixDemo() {
  const [saved, setSaved] = useState<Grants>(initialGrants)
  const [grants, setGrants] = useState<Grants>(initialGrants)
  const [roleId, setRoleId] = useState('editor')

  const role = getRole(roleId)
  const changed = useMemo(() => changes(saved, grants), [saved, grants])

  const states = allCells
    .map((cell) => cellState(roleId, cell, grants))
    .filter((s) => s.kind !== 'unavailable')
  const granted = states.filter(isOn).length
  const inherited = states.filter((s) => s.kind === 'inherited').length

  return (
    <div className="space-y-3">
      <div
        role="group"
        aria-label="Role"
        className="flex gap-1 overflow-x-auto rounded-lg bg-muted p-1"
      >
        {roles.map((r) => {
          const dirty = [...changed].some((c) => c.startsWith(`${r.id}:`))
          return (
            <button
              key={r.id}
              type="button"
              aria-pressed={r.id === roleId}
              onClick={() => setRoleId(r.id)}
              className="flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-xs"
            >
              {r.locked ? <Lock className="size-3.5" /> : null}
              {r.name}
              {dirty ? (
                <>
                  <span
                    aria-hidden
                    className="size-1.5 rounded-full bg-amber-500"
                  />
                  <span className="sr-only">(unsaved changes)</span>
                </>
              ) : null}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div className="space-y-0.5">
          <p className="text-sm">
            <span className="font-medium">{role.name}</span>{' '}
            <span className="text-muted-foreground">{role.description}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {role.locked
              ? 'System role. It always has every permission and cannot be edited.'
              : role.inherits
                ? `Inherits everything ${getRole(role.inherits).name} can do. Change those on the ${getRole(role.inherits).name} tab.`
                : 'A base role. Roles that inherit from it get these permissions too.'}
          </p>
        </div>
        <Legend />
      </div>

      <PermissionsTable
        roleId={roleId}
        grants={grants}
        changed={changed}
        setCells={(cells, on) =>
          setGrants((current) => setCells(current, roleId, cells, on))
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground tabular-nums">
          {granted} of {states.length} permissions
          {inherited ? `, ${inherited} inherited` : ''}
        </p>
        <div className="flex items-center gap-2">
          <span
            aria-live="polite"
            className={cn(
              'text-sm whitespace-nowrap tabular-nums',
              changed.size ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            {changed.size
              ? `${changed.size} unsaved change${changed.size === 1 ? '' : 's'}`
              : 'All changes saved'}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!changed.size}
            onClick={() => setGrants(saved)}
          >
            Discard
          </Button>
          <Button
            size="sm"
            disabled={!changed.size}
            onClick={() => setSaved(grants)}
          >
            Save changes
          </Button>
        </div>
      </div>
    </div>
  )
}

function Legend() {
  const swatch = 'pointer-events-none'
  return (
    <ul
      aria-label="Legend"
      className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground"
    >
      <li className="flex items-center gap-1.5">
        <Checkbox checked tabIndex={-1} aria-hidden className={swatch} />
        Granted
      </li>
      <li className="flex items-center gap-1.5">
        <Checkbox
          checked
          tabIndex={-1}
          aria-hidden
          className={cn(
            swatch,
            'border-transparent data-[state=checked]:border-transparent data-[state=checked]:bg-muted-foreground/25 data-[state=checked]:text-foreground',
          )}
        />
        Inherited
      </li>
      <li className="flex items-center gap-1.5">
        <Checkbox
          checked
          tabIndex={-1}
          aria-hidden
          className={cn(swatch, 'opacity-50')}
        />
        Required by another action
      </li>
      <li className="flex items-center gap-1.5">
        <span aria-hidden className="w-4 text-center text-muted-foreground/50">
          –
        </span>
        Not available
      </li>
    </ul>
  )
}
