import { createFileRoute } from '@tanstack/react-router'
import { ColumnPinningTableDemo } from '#/components/column-pinning'
import indexSource from '#/components/column-pinning/index.tsx?raw'
import columnsSource from '#/components/column-pinning/columns.tsx?raw'
import dataTableSource from '#/components/column-pinning/data-table.tsx?raw'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'

const files = [
  { path: 'src/components/column-pinning/index.tsx', code: indexSource },
  { path: 'src/components/column-pinning/columns.tsx', code: columnsSource },
  {
    path: 'src/components/column-pinning/data-table.tsx',
    code: dataTableSource,
  },
]

const steps = [
  {
    title: 'columnPinning is just more TanStack Table state',
    description:
      "Pinning isn't a separate system bolted onto the table — it's a ColumnPinningState of { left: string[], right: string[] } wired through state/onColumnPinningChange exactly like sorting or filtering. column.pin('left'), column.pin('right'), and column.pin(false) mutate that state for you.",
    file: 'src/components/column-pinning/data-table.tsx',
    code: `const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(
  initialPinning ?? {},
)

const table = useReactTable({
  data,
  columns,
  state: { columnPinning },
  onColumnPinningChange: setColumnPinning,
})`,
  },
  {
    title: 'Pinned cells become sticky, offset by the other pinned columns',
    description:
      "getStart('left') sums the widths of every column pinned left before this one, and getAfter('right') does the same from the right edge — so a second left-pinned column sticks right next to the first instead of overlapping it. Unpinned columns stay position: relative and scroll normally.",
    file: 'src/components/column-pinning/data-table.tsx',
    code: `function getPinningStyles(column) {
  const isPinned = column.getIsPinned()
  return {
    left: isPinned === 'left' ? \`\${column.getStart('left')}px\` : undefined,
    right: isPinned === 'right' ? \`\${column.getAfter('right')}px\` : undefined,
    position: isPinned ? 'sticky' : 'relative',
    zIndex: isPinned ? 1 : 0,
  }
}`,
  },
  {
    title: 'The boundary shadow only appears on the outermost pinned cell',
    description:
      "getIsLastColumn('left') and getIsFirstColumn('right') identify the cell sitting right at the scroll boundary — that's the only place the drop-shadow divider is drawn, which is what makes a block of pinned columns read as one solid panel instead of every cell getting its own shadow.",
    file: 'src/components/column-pinning/data-table.tsx',
    code: `const isLastLeftPinned =
  isPinned === 'left' && column.getIsLastColumn('left')
const isFirstRightPinned =
  isPinned === 'right' && column.getIsFirstColumn('right')

className={cn(
  isLastLeftPinned && 'shadow-[2px_0_4px_-2px_rgba(0,0,0,0.15)]',
  isFirstRightPinned && 'shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.15)]',
)}`,
  },
  {
    title: 'Sticky cells need an opaque background of their own',
    description:
      'A sticky cell sits above the rows scrolling underneath it, so without bg-background it would show the row content bleeding through. Every pinned header and cell gets that class regardless of pin side.',
    file: 'src/components/column-pinning/data-table.tsx',
    code: `<TableHead className={cn('group/head bg-background', ...)}>
<TableCell className={cn('bg-background', ...)}>`,
  },
  {
    title: 'Pin controls live in the header and default to hidden',
    description:
      "Each header renders pin-left / pin-right buttons (or a single unpin button once pinned) inside a group that's opacity-0 by default and opacity-100 on header hover — the same interaction AG Grid and Excel use, without needing a context menu.",
    file: 'src/components/column-pinning/data-table.tsx',
    code: `<Button
  className="opacity-0 group-hover/head:opacity-100"
  onClick={() => column.pin('left')}
>
  <ArrowLeftToLine />
</Button>`,
  },
]

export const Route = createFileRoute('/column-pinning-table')({
  head: () => ({
    meta: [
      { title: 'Column Pinning Table — ShadTable' },
      {
        name: 'description',
        content:
          'Excel/AG Grid–style column pinning: freeze columns to the left or right edge while the rest of the table scrolls underneath.',
      },
      { property: 'og:title', content: 'Column Pinning Table — ShadTable' },
      {
        property: 'og:description',
        content:
          'A data table with sticky, pinnable columns built on shadcn/ui and TanStack Table column pinning.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Column Pinning Table',
          description:
            'A data table with sticky, pinnable columns — pin left, pin right, or unpin from a hover control in the header.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
        },
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://shad-table.dev/column-pinning-table',
      },
    ],
  }),
  component: ColumnPinningTablePage,
})

function ColumnPinningTablePage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Column Pinning Table
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Freeze columns to the left or right edge — Excel/AG Grid style —
            while the rest of the table scrolls underneath. Hover a header
            to pin it left or right; hover a pinned header to unpin it.
          </p>
        </div>

        <InstallCommand name="column-pinning-table" />

        <ComponentPreview
          preview={<ColumnPinningTableDemo />}
          files={files}
        />

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
