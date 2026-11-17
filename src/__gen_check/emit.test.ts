import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { it } from 'vitest'
import { generate } from '#/components/builder/generate'
import { defaultState, featureBlocks } from '#/components/builder/schema'
import type { BuilderState } from '#/components/builder/schema'
import { templates } from '#/components/builder/templates'

const all = featureBlocks.map((f) => f.id)
const rich: BuilderState = {
  ...defaultState,
  columns: [
    { id: 'name', name: 'Name', type: 'text', pin: 'left', rules: { required: true, max: 20 } },
    { id: 'status', name: 'Status', type: 'select', options: ['A', "B's"] },
    { id: 'budget', name: 'Budget', type: 'number', align: 'right', rules: { min: 0, integer: true } },
    { id: 'due', name: 'Due', type: 'date', pin: 'right' },
    { id: 'done', name: 'Done', type: 'checkbox' },
    { id: 'note', name: 'Note', type: 'text', readOnly: true },
  ],
  features: all,
}
const cases: Record<string, BuilderState> = {
  kitchen: rich,
  noFilters: { ...rich, features: all.filter((f) => f !== 'filters') },
  noAlign: { ...rich, columns: rich.columns.map(({ align: _a, ...c }) => c), features: ['editing', 'pinning', 'export', 'columnVisibility'] },
  actionsOnly: { ...rich, features: ['rowActions'], actions: ['copy'] },
  editOnly: { ...rich, features: ['editing'] },
  spinner: { ...rich, states: { ...rich.states, loadingStyle: 'spinner' } },
  defaults: defaultState,
  ...Object.fromEntries(templates.map((t) => ['tpl_' + t.id, t.state])),
}
it('emits', () => {
  for (const [name, state] of Object.entries(cases)) {
    for (const f of generate(state)) {
      const out = join('src/__gen_check', name, f.path.split('/').pop()!)
      mkdirSync(dirname(out), { recursive: true })
      writeFileSync(out, f.code)
    }
  }
})
