import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import columnsSource from './columns.tsx?raw'
import tableSource from './data-table.tsx?raw'
import demoSource from './index.tsx?raw'
import { TreeTableDemo } from './index'

const files = [
  { path: 'src/components/tree/columns.tsx', code: columnsSource },
  { path: 'src/components/tree/data-table.tsx', code: tableSource },
  { path: 'src/components/tree/index.tsx', code: demoSource },
]

const steps = [
  {
    title: 'Rows are nested, not flat',
    description:
      'Each node carries its own children array (department → team → employee). getSubRows tells TanStack Table how to find a row\'s children, so the whole hierarchy is built from one recursive data structure instead of a flat list plus a parentId lookup.',
    file: 'src/components/tree/data-table.tsx',
    code: `const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSubRows: (row) => row.children,
  getExpandedRowModel: getExpandedRowModel(),
  // ...
})`,
  },
  {
    title: 'Depth drives indentation',
    description:
      "Every row TanStack produces carries a depth (0 for roots, 1 for their children, and so on). The Name cell reads row.depth directly into an inline padding-left — no manual recursion needed to indent nested rows.",
    file: 'src/components/tree/columns.tsx',
    code: `cell: ({ row }) => (
  <div
    className="flex items-center gap-1.5"
    style={{ paddingLeft: \`\${row.depth * 1.25}rem\` }}
  >
    {/* expand toggle + row.original.name */}
  </div>
)`,
  },
  {
    title: 'Expansion is just table state',
    description:
      'expanded is a normal piece of controlled state, the same shape as sorting or column filters elsewhere in this library. Each toggle button calls row.getToggleExpandedHandler() — clicking it flips that row in and out of expanded, and getExpandedRowModel recomputes which sub-rows are currently visible.',
    file: 'src/components/tree/columns.tsx',
    code: `<button
  type="button"
  onClick={row.getToggleExpandedHandler()}
  aria-label={row.getIsExpanded() ? 'Collapse row' : 'Expand row'}
>
  <ChevronRight className={row.getIsExpanded() ? 'rotate-90' : ''} />
</button>`,
  },
  {
    title: 'Search keeps a matching row\'s ancestors visible',
    description:
      "filterFromLeafRows: true changes how getFilteredRowModel treats the tree: a branch survives filtering if any descendant matches, not just the row itself. Without it, searching \"Ava\" would hide the whole Engineering → Frontend branch because the department and team rows don't contain that text.",
    file: 'src/components/tree/data-table.tsx',
    code: `getFilteredRowModel: getFilteredRowModel(),
filterFromLeafRows: true,`,
  },
  {
    title: 'Pagination is left out on purpose',
    description:
      "TanStack's row model pipeline runs pagination after expansion, so slicing by row count would cut a parent's children off at a page boundary and split the tree mid-branch. This example only composes sorting, filtering, and expansion — add pagination only once you've decided how a split branch should behave.",
    file: 'src/components/tree/data-table.tsx',
    code: `// getPaginationRowModel intentionally omitted —
// it runs after getExpandedRowModel and would
// paginate expanded child rows, not just roots.`,
  },
]

export function TreeTablePage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Tree Table</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A hierarchical table for nested data — departments, teams, and
            employees — with expand/collapse, sorting, and a search box that
            keeps a matching row's ancestors visible.
          </p>
        </div>

        <InstallCommand name="tree-table" />

        <ComponentPreview preview={<TreeTableDemo />} files={files} />

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
