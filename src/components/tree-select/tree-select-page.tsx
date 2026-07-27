import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import columnsSource from './columns.tsx?raw'
import tableSource from './data-table.tsx?raw'
import demoSource from './index.tsx?raw'
import { TreeSelectDemo } from './index'

const files = [
  { path: 'src/components/tree-select/columns.tsx', code: columnsSource },
  { path: 'src/components/tree-select/data-table.tsx', code: tableSource },
  { path: 'src/components/tree-select/index.tsx', code: demoSource },
]

const steps = [
  {
    title: 'Cascading selection is a built-in feature, not custom code',
    description:
      "TanStack Table's row selection feature already understands getSubRows: checking a parent's checkbox selects every one of its descendants for free, no manual recursion needed. row.toggleSelected(true) on the Engineering row selects Frontend, Backend, and every employee beneath them in one call.",
    file: 'src/components/tree-select/columns.tsx',
    code: `cell: ({ row }) => (
  <Checkbox
    checked={row.getIsSelected() ? true : row.getIsSomeSelected() ? 'indeterminate' : false}
    onCheckedChange={(value) => row.toggleSelected(!!value)}
  />
)`,
  },
  {
    title: 'Partial selection shows as indeterminate',
    description:
      "row.getIsSomeSelected() reports true when some (but not all) of a row's descendants are selected — deselect just Liam Chen and the Frontend and Engineering checkboxes both drop from checked to indeterminate, without any manual bookkeeping of which branch is partially selected.",
    file: 'src/components/tree-select/columns.tsx',
    code: `checked={
  row.getIsSelected()
    ? true
    : row.getIsSomeSelected()
      ? 'indeterminate'
      : false
}`,
  },
  {
    title: 'The header checkbox reflects the whole tree',
    description:
      "table.getIsAllRowsSelected() and table.getIsSomeRowsSelected() aggregate across every row in the table, not just the visible/expanded ones, so the header checkbox is accurate even while some branches are collapsed. table.toggleAllRowsSelected(true) cascades a full select-all through every branch in one call.",
    file: 'src/components/tree-select/columns.tsx',
    code: `header: ({ table }) => (
  <Checkbox
    checked={
      table.getIsAllRowsSelected()
        ? true
        : table.getIsSomeRowsSelected()
          ? 'indeterminate'
          : false
    }
    onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
  />
)`,
  },
  {
    title: 'Selection and expansion are independent state',
    description:
      "rowSelection and expanded are two separate pieces of controlled state. Collapsing Frontend doesn't clear Ava and Liam's selection — it just hides two already-selected rows. Re-expanding shows their checkboxes still checked, and the selected-count summary above the table never changes because it reads from the full row model, not just the currently visible rows.",
    file: 'src/components/tree-select/data-table.tsx',
    code: `const selectedCount = table.getSelectedRowModel().flatRows.length
const totalCount = table.getRowModel().flatRows.length`,
  },
  {
    title: 'getSelectedRowModel().rows is not a flat count for tree data',
    description:
      "For nested rows, .rows only contains the top-level selected nodes with their selected descendants nested underneath (it preserves the hierarchy), so checking Engineering alone reports rows.length === 1 even though 7 rows are actually checked. .flatRows walks every selected row at every depth, which is what a \"12 of 25 selected\" style summary actually needs.",
    file: 'src/components/tree-select/data-table.tsx',
    code: `// Selecting just "Engineering" (which cascades to 6 descendants):
table.getSelectedRowModel().rows.length     // 1 — only the root match
table.getSelectedRowModel().flatRows.length // 7 — every selected row`,
  },
]

export function TreeSelectPage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Tree Table — Checkbox Selection
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The same department/team/employee tree, with a checkbox column
            that cascades selection from a parent down to every descendant
            and reports indeterminate state for partially-selected branches.
          </p>
        </div>

        <InstallCommand name="tree-table-selection" />

        <ComponentPreview preview={<TreeSelectDemo />} files={files} />

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
