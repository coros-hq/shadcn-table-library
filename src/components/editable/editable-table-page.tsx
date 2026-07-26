import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import columnsSource from './columns.tsx?raw'
import tableSource from './data-table.tsx?raw'
import demoSource from './index.tsx?raw'
import { EditableTableDemo } from './index'

const files = [
  { path: 'src/components/editable/columns.tsx', code: columnsSource },
  { path: 'src/components/editable/data-table.tsx', code: tableSource },
  { path: 'src/components/editable/index.tsx', code: demoSource },
]

const steps = [
  {
    title: 'Editing state lives outside TanStack Table entirely',
    description:
      'editingCell, draftValue, errors, and pendingCells are plain useState — none of it is a TanStack Table feature. Each editable cell just reads that local state to decide whether to render an <Input> or the formatted value, the same way the Tree Table reads expanded state to decide whether to show children.',
    file: 'src/components/editable/data-table.tsx',
    code: `const [editingCell, setEditingCell] = useState<{ rowId: string; columnId: string } | null>(null)
const [draftValue, setDraftValue] = useState('')
const [errors, setErrors] = useState<Record<string, string>>({})
const [pendingCells, setPendingCells] = useState<Set<string>>(new Set())`,
  },
  {
    title: 'Validation runs once, at commit — not on every keystroke',
    description:
      "field.validate(draftValue) only runs when the user presses Enter or the input blurs. An invalid value never reaches data — commitEdit exits edit mode without writing anything, and flashError puts the error message where the value used to be for two seconds before clearing itself.",
    file: 'src/components/editable/data-table.tsx',
    code: `const error = field.validate(draftValue)
if (error) {
  flashError(key, error)
  setEditingCell(null)
  return
}`,
  },
  {
    title: 'The row updates before the save finishes — an optimistic update',
    description:
      "commitEdit writes the new value into data immediately, synchronously, through onDataChange. Only after that does saveOptimistically kick off a fake 600ms network call — the cell is already showing the new value the whole time that's in flight, just dimmed via the pending flag instead of being locked.",
    file: 'src/components/editable/data-table.tsx',
    code: `onDataChange((prev) =>
  prev.map((r) => (r.id === rowId ? { ...r, [columnId]: parsedValue } : r)),
)
setHistory((prev) => [...prev, { rowId, columnId, previousValue }])
saveOptimistically(rowId, columnId, previousValue, key)`,
  },
  {
    title: 'A failed save rolls back automatically',
    description:
      "saveOptimistically simulates a 15% failure rate. On failure it writes previousValue straight back into data and removes that edit from the undo history — there's nothing to undo, since the save never actually went through — then flashes \"Save failed — reverted\" on that exact cell.",
    file: 'src/components/editable/data-table.tsx',
    code: `if (failed) {
  onDataChange((prev) =>
    prev.map((r) => (r.id === rowId ? { ...r, [columnId]: previousValue } : r)),
  )
  // ...remove the matching entry from history
  flashError(key, 'Save failed — reverted')
}`,
  },
  {
    title: 'Undo pops one { rowId, columnId, previousValue } at a time',
    description:
      "Every successful commit pushes its previous value onto a history stack. The Undo button pops the most recent entry and writes previousValue back — deliberately bypassing the optimistic-save simulation, since undo is correcting a local mistake, not re-submitting to a server, so it's assumed to always succeed.",
    file: 'src/components/editable/data-table.tsx',
    code: `function undo() {
  setHistory((prev) => {
    if (prev.length === 0) return prev
    const last = prev[prev.length - 1]
    onDataChange((data) =>
      data.map((r) => (r.id === last.rowId ? { ...r, [last.columnId]: last.previousValue } : r)),
    )
    return prev.slice(0, -1)
  })
}`,
  },
]

export function EditableTablePage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Editable Table
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Click a cell to edit it inline. Edits validate on commit, apply
            optimistically before a simulated save resolves, roll back on a
            simulated failure, and can be undone one at a time.
          </p>
        </div>

        <InstallCommand name="editable-table" />

        <ComponentPreview preview={<EditableTableDemo />} files={files} />

        <div className="space-y-2">
          <p className="text-sm font-medium">How it works</p>
          <div className="divide-y rounded-lg border">
            {steps.map((step, i) => (
              <div key={step.title} className="p-4">
                <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <span className="text-muted-foreground">{i + 1}.</span>
                  {step.title}
                </p>
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
