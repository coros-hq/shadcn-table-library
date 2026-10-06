import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import tableSource from './data-table.tsx?raw'
import formulaSource from './formula.ts?raw'
import columnsSource from './columns.tsx?raw'
import dataSource from './data.ts?raw'
import demoSource from './index.tsx?raw'
import { SpreadsheetDemo } from './index'
import vueSpreadsheetDemoSource from '#/components/vue/spreadsheet/SpreadsheetDemo.vue?raw'
import vueSpreadsheetTableSource from '#/components/vue/spreadsheet/SpreadsheetTable.vue?raw'
import vueSpreadsheetColumnsSource from '#/components/vue/spreadsheet/columns.ts?raw'
import vueSpreadsheetFormulaSource from '#/components/vue/spreadsheet/formula.ts?raw'
import vueSpreadsheetDataSource from '#/components/vue/spreadsheet/data.ts?raw'

const files = [
  { path: 'src/components/spreadsheet/data-table.tsx', code: tableSource },
  { path: 'src/components/spreadsheet/formula.ts', code: formulaSource },
  { path: 'src/components/spreadsheet/columns.tsx', code: columnsSource },
  { path: 'src/components/spreadsheet/data.ts', code: dataSource },
  { path: 'src/components/spreadsheet/index.tsx', code: demoSource },
]

const vueFiles = [
  {
    path: 'src/components/spreadsheet/SpreadsheetDemo.vue',
    code: vueSpreadsheetDemoSource,
  },
  {
    path: 'src/components/spreadsheet/SpreadsheetTable.vue',
    code: vueSpreadsheetTableSource,
  },
  {
    path: 'src/components/spreadsheet/columns.ts',
    code: vueSpreadsheetColumnsSource,
  },
  {
    path: 'src/components/spreadsheet/formula.ts',
    code: vueSpreadsheetFormulaSource,
  },
  {
    path: 'src/components/spreadsheet/data.ts',
    code: vueSpreadsheetDataSource,
  },
]

const vueDeps = {
  npm: [],
  shadcn: ['table'],
}

const steps = [
  {
    title: 'Raw strings are the data; the table renders a computed copy',
    description:
      'Every cell is stored exactly as typed, including formulas. The sheet is re-evaluated from those strings whenever one changes, and the table is handed the evaluated text. Editing, copying and clearing all work on raw input, while TanStack Table only ever sees display values.',
    file: 'src/components/spreadsheet/data-table.tsx',
    code: `const computed = useMemo(() => evaluateSheet(raw), [raw])
const rows = useMemo<SheetRow[]>(
  () => computed.map((cells, r) => ({ n: r + 1, cells })),
  [computed],
)`,
  },
  {
    title: 'The active cell is state, not DOM focus',
    description:
      'Cells are never focused individually. One keydown handler on the grid moves an { r, c } position, and the cell at that position gets the outline. That keeps arrow keys, Tab and typing-to-edit in one place and avoids hundreds of tab stops. A second position, the anchor, turns Shift + arrows and mouse drags into a rectangular range.',
    file: 'src/components/spreadsheet/data-table.tsx',
    code: `function select(pos: Pos, extend = false) {
  setActive(pos)
  if (!extend) setAnchor(pos)
}`,
  },
  {
    title: 'Formulas are parsed, not eval-ed',
    description:
      'A small recursive-descent parser handles + - * /, parentheses, A1 references, ranges, and SUM, AVERAGE, MIN, MAX and COUNT. Cells are evaluated on demand and cached, so a formula can depend on another formula. A cell reached again while it is still being evaluated is a cycle and shows #CIRC! instead of overflowing the stack.',
    file: 'src/components/spreadsheet/formula.ts',
    code: `if (visiting.has(key)) throw err('#CIRC!')
visiting.add(key)
try {
  const value = compute(raw[r][c])
  cache.set(key, value)
  return value
} finally {
  visiting.delete(key)
}`,
  },
  {
    title: 'The editor owns its keys and commits exactly once',
    description:
      'While editing, the input stops key events from reaching the grid, so arrow keys move the caret instead of the selection. Enter and Tab commit and move on; Escape discards. Clicking away also commits through blur, which can fire again as the input unmounts, so the draft lives in a ref that is cleared on the first commit.',
    file: 'src/components/spreadsheet/data-table.tsx',
    code: `function commit(move?: Pos, refocus = true) {
  const draft = editingRef.current
  if (draft === null) return
  writeCells([[active, draft]])
  setEditing(null)
  if (move) moveBy(move.r, move.c)
  if (refocus) gridRef.current?.focus()
}`,
  },
  {
    title: 'Copy and paste use plain tab-separated text',
    description:
      'Copy writes the selected cells as rows separated by newlines and columns by tabs, the format Excel and Google Sheets use, so ranges move between this table and a real spreadsheet. Paste splits the same format and writes it from the top-left of the selection, clipping anything beyond the grid.',
    file: 'src/components/spreadsheet/data-table.tsx',
    code: `e.clipboardData.setData('text/plain', lines.join('\n'))
// ...
const pasted = text.split('\n').map((line) => line.split('\t'))`,
  },
]

export function SpreadsheetPage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-normal tracking-tight sm:text-4xl">
            Shadcn Excel-like Table
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground text-balance">
            A spreadsheet grid built on TanStack Table: A1 column and row
            headers, an active cell you move with the keyboard, range selection,
            type-to-edit, copy and paste, and formulas like{' '}
            <code>=SUM(B2:D2)</code> that recalculate as you edit.
          </p>
        </div>

        <InstallCommand name="spreadsheet-table" />

        <ComponentPreview
          preview={<SpreadsheetDemo />}
          files={files}
          vueFiles={vueFiles}
          vueDeps={vueDeps}
        />

        <div className="space-y-2">
          <h2 className="text-sm font-medium">How it works</h2>
          <div className="divide-y rounded-lg border">
            {steps.map((step, i) => (
              <div key={step.title} className="p-4">
                <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <span className="text-muted-foreground">{i + 1}.</span>
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
                <CodeBlock
                  filename={step.file}
                  code={step.code}
                  className="mt-3"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </DocsLayout>
  )
}
