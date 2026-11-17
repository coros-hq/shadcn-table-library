import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { it } from 'vitest'
import { generate } from '#/components/builder/generate'
import { coerceRows, inferImport, parseInput } from '#/components/builder/import'
import { defaultState, featureBlocks, replaceColumns } from '#/components/builder/schema'

const CSV = `name,plan,seats,renews,active,meta
Ada,Pro,12,2025-09-01,yes,"{""a"":1}"
Alan,Free,,2025-03-15,no,x
Grace,Pro,4,,yes,y
Bob,Free,3,2025-01-01,no,z`
it('emits', () => {
  const { columns, data } = inferImport(parseInput(CSV), 't')
  const base = replaceColumns(defaultState, columns)
  const rows = coerceRows(base.columns, data)
  const cases = {
    imp_all: { ...base, features: featureBlocks.map((f) => f.id) },
    imp_plain: { ...base, features: [] },
  }
  for (const [name, state] of Object.entries(cases)) {
    for (const f of generate(state, { rows })) {
      const dir = join('src/__gen_check', name)
      mkdirSync(dir, { recursive: true })
      writeFileSync(join(dir, f.path.split('/').pop()!), f.code)
    }
  }
})
