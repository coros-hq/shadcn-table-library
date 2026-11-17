import { describe, expect, it } from 'vitest'
import { cellsFor } from '#/components/permissions-matrix/columns'
import {
  initialGrants,
  resourceGroups,
} from '#/components/permissions-matrix/data'
import type { Action } from '#/components/permissions-matrix/data'
import {
  cellState,
  changes,
  setCells,
  summarize,
} from '#/components/permissions-matrix/permissions'

const resource = (id: string) =>
  resourceGroups.flatMap((g) => g.resources).find((r) => r.id === id)!
const cell = (id: string, action: Action) => ({
  resource: resource(id),
  action,
})
const kind = (
  roleId: string,
  id: string,
  action: Action,
  grants = initialGrants,
) => cellState(roleId, cell(id, action), grants).kind

describe('cellState', () => {
  it('marks actions a resource does not support as unavailable', () => {
    expect(kind('admin', 'invoices', 'delete')).toBe('unavailable')
    expect(kind('owner', 'audit-log', 'edit')).toBe('unavailable')
  })

  it('locks every supported action for the owner', () => {
    expect(kind('owner', 'roles', 'delete')).toBe('locked')
  })

  it('inherits through the whole chain and names the nearest source', () => {
    expect(kind('admin', 'projects', 'view')).toBe('inherited')
    const state = cellState('admin', cell('projects', 'create'), initialGrants)
    expect(state).toMatchObject({ kind: 'inherited', from: { id: 'editor' } })
    // Billing inherits from Viewer only, not from Editor
    expect(kind('billing', 'projects', 'create')).toBe('denied')
  })

  it('keeps View on while another action needs it', () => {
    expect(cellState('editor', cell('env', 'view'), initialGrants)).toEqual({
      kind: 'required',
      by: ['create', 'edit'],
    })
    expect(kind('billing', 'invoices', 'view')).toBe('required')
  })
})

describe('setCells', () => {
  it('grants View along with any other action', () => {
    const next = setCells(
      initialGrants,
      'billing',
      [cell('roles', 'edit')],
      true,
    )
    expect(next.billing.has('roles.view')).toBe(true)
    expect(kind('billing', 'roles', 'view', next)).toBe('required')
  })

  it('does not copy View into a role that already inherits it', () => {
    const next = setCells(
      initialGrants,
      'editor',
      [cell('members', 'edit')],
      true,
    )
    expect(next.editor.has('members.view')).toBe(false)
    expect(kind('editor', 'members', 'view', next)).toBe('inherited')
  })

  it('never touches inherited, locked or unavailable cells', () => {
    const all = cellsFor(resourceGroups.flatMap((g) => g.resources))
    expect(setCells(initialGrants, 'owner', all, false)).toBe(initialGrants)
    const cleared = setCells(initialGrants, 'admin', all, false)
    expect(cleared.admin.size).toBe(0)
    expect(kind('admin', 'projects', 'edit', cleared)).toBe('inherited')
  })

  it('updates child roles as soon as a parent changes', () => {
    const next = setCells(
      initialGrants,
      'viewer',
      [cell('invoices', 'view')],
      true,
    )
    expect(kind('editor', 'invoices', 'view', next)).toBe('inherited')
    expect(kind('admin', 'invoices', 'view', next)).toBe('inherited')
  })

  it('revokes a whole row in one go, View included', () => {
    const row = cellsFor([resource('payment-methods')])
    const next = setCells(initialGrants, 'billing', row, false)
    for (const a of ['view', 'create', 'edit', 'delete'] as const) {
      expect(kind('billing', 'payment-methods', a, next)).toBe('denied')
    }
  })
})

describe('summarize', () => {
  it('is indeterminate when only some cells are on, and grants on click', () => {
    const row = cellsFor([resource('payment-methods')])
    const summary = summarize('billing', row, initialGrants)
    expect(summary).toEqual({
      checked: 'indeterminate',
      enabled: true,
      next: true,
    })
  })

  it('is disabled when every cell is inherited or locked', () => {
    expect(
      summarize('owner', cellsFor([resource('roles')]), initialGrants),
    ).toEqual({
      checked: true,
      enabled: false,
      next: false,
    })
  })

  it('ignores unavailable cells when counting', () => {
    const row = cellsFor([resource('invoices')])
    expect(summarize('billing', row, initialGrants).checked).toBe(true)
  })
})

describe('changes', () => {
  it('lists added and removed grants per role', () => {
    let next = setCells(
      initialGrants,
      'editor',
      [cell('projects', 'export')],
      false,
    )
    next = setCells(next, 'billing', [cell('audit-log', 'view')], true)
    expect([...changes(initialGrants, next)].sort()).toEqual([
      'billing:audit-log.view',
      'editor:projects.export',
    ])
  })
})
