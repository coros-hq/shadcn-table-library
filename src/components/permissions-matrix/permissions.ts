import { actions, roles } from './data'
import type { Action, Grants, Resource, Role } from './data'

// Every checkbox in the matrix is one of these. Only the stored grants are
// state; whether a cell is inherited, required or locked is worked out from
// them on every render, so editing a parent role updates its children at once.
export type CellState =
  | { kind: 'unavailable' }
  | { kind: 'locked'; role: Role }
  | { kind: 'inherited'; from: Role }
  | { kind: 'required'; by: Action[] }
  | { kind: 'granted' }
  | { kind: 'denied' }

export interface Cell {
  resource: Resource
  action: Action
}

export const key = (resourceId: string, action: Action) =>
  `${resourceId}.${action}`

const roleById = new Map(roles.map((role) => [role.id, role]))
export const getRole = (id: string) => roleById.get(id)!

/** Parent first, then grandparent, and so on */
function ancestors(role: Role): Role[] {
  const chain: Role[] = []
  let parent = role.inherits ? roleById.get(role.inherits) : undefined
  while (parent && !chain.includes(parent)) {
    chain.push(parent)
    parent = parent.inherits ? roleById.get(parent.inherits) : undefined
  }
  return chain
}

/** The nearest ancestor that grants this permission, if any */
function inheritedFrom(role: Role, k: string, grants: Grants) {
  return ancestors(role).find((a) => a.locked || grants[a.id].has(k))
}

export function cellState(
  roleId: string,
  { resource, action }: Cell,
  grants: Grants,
): CellState {
  if (!resource.actions.includes(action)) return { kind: 'unavailable' }
  const role = getRole(roleId)
  if (role.locked) return { kind: 'locked', role }
  const k = key(resource.id, action)
  const from = inheritedFrom(role, k, grants)
  if (from) return { kind: 'inherited', from }
  const own = grants[roleId] ?? new Set<string>()
  if (!own.has(k)) return { kind: 'denied' }
  if (action === 'view') {
    // Every other action needs View, so it stays on while any of them is granted
    const by = resource.actions.filter(
      (a) => a !== 'view' && own.has(key(resource.id, a)),
    )
    if (by.length) return { kind: 'required', by }
  }
  return { kind: 'granted' }
}

export const isOn = (state: CellState) =>
  state.kind !== 'denied' && state.kind !== 'unavailable'

/** Cells this role decides for itself, the ones a bulk toggle may change */
export const isOwn = (state: CellState) =>
  state.kind === 'granted' ||
  state.kind === 'denied' ||
  state.kind === 'required'

/** Grant or revoke several cells for one role, keeping View wherever another action needs it */
export function setCells(
  grants: Grants,
  roleId: string,
  cells: Cell[],
  on: boolean,
): Grants {
  const targets = cells.filter((c) => isOwn(cellState(roleId, c, grants)))
  if (!targets.length) return grants
  const next = new Set(grants[roleId])
  for (const { resource, action } of targets) {
    if (on) next.add(key(resource.id, action))
    else next.delete(key(resource.id, action))
  }
  const resources = new Set(targets.map((c) => c.resource))
  for (const resource of resources) {
    const needsView = resource.actions.some(
      (a) => a !== 'view' && next.has(key(resource.id, a)),
    )
    const viewKey = key(resource.id, 'view')
    const viewInherited = inheritedFrom(getRole(roleId), viewKey, grants)
    if (needsView && !viewInherited) next.add(viewKey)
  }
  return { ...grants, [roleId]: next }
}

export interface Summary {
  checked: boolean | 'indeterminate'
  /** False when none of the cells can be changed for this role */
  enabled: boolean
  /** What clicking the summary checkbox does */
  next: boolean
}

/** The tri-state checkbox for a row, a group or a whole column */
export function summarize(
  roleId: string,
  cells: Cell[],
  grants: Grants,
): Summary {
  const states = cells
    .map((c) => cellState(roleId, c, grants))
    .filter((s) => s.kind !== 'unavailable')
  const on = states.filter(isOn).length
  const own = states.filter(isOwn)
  return {
    checked: on === 0 ? false : on === states.length ? true : 'indeterminate',
    enabled: own.length > 0,
    next: !own.every(isOn),
  }
}

/** Grants that differ from the last save, per role */
export function changes(saved: Grants, current: Grants) {
  const changed = new Set<string>()
  for (const role of roles) {
    const a = saved[role.id] ?? new Set<string>()
    const b = current[role.id] ?? new Set<string>()
    for (const k of a) if (!b.has(k)) changed.add(`${role.id}:${k}`)
    for (const k of b) if (!a.has(k)) changed.add(`${role.id}:${k}`)
  }
  return changed
}

export const actionLabel = Object.fromEntries(
  actions.map((a) => [a.id, a.label]),
) as Record<Action, string>

export function describe(state: CellState) {
  switch (state.kind) {
    case 'unavailable':
      return 'Not available for this resource'
    case 'locked':
      return `${state.role.name} always has every permission`
    case 'inherited':
      return `Inherited from ${state.from.name}`
    case 'required': {
      const list = state.by.map((a) => actionLabel[a])
      return `Needed by ${list.join(' and ')}. Remove ${list.length > 1 ? 'those' : 'that'} first.`
    }
    case 'granted':
      return 'Granted'
    case 'denied':
      return 'Not granted'
  }
}
