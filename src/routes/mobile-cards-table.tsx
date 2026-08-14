import { createFileRoute } from '@tanstack/react-router'
import { MobileCardsTableDemo } from '#/components/mobile-cards'
import indexSource from '#/components/mobile-cards/index.tsx?raw'
import columnsSource from '#/components/mobile-cards/columns.tsx?raw'
import dataTableSource from '#/components/mobile-cards/data-table.tsx?raw'
import viewportToggleSource from '#/components/mobile-cards/viewport-toggle.tsx?raw'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'

const files = [
  { path: 'src/components/mobile-cards/index.tsx', code: indexSource },
  { path: 'src/components/mobile-cards/columns.tsx', code: columnsSource },
  {
    path: 'src/components/mobile-cards/data-table.tsx',
    code: dataTableSource,
  },
  {
    path: 'src/components/mobile-cards/viewport-toggle.tsx',
    code: viewportToggleSource,
  },
]

const steps = [
  {
    title: 'Every table element gets a display override, not a second layout',
    description:
      "There's no separate mobile component and no JS media-query hook — the same <thead>/<tbody>/<tr>/<td> markup renders both views. Below the breakpoint every element is forced to block/flex; above it, the variant puts it back to its native table display (table, table-row-group, table-row, table-cell).",
    file: 'src/components/mobile-cards/data-table.tsx',
    code: `<Table className="block @[48rem]:table">
  <TableHeader className="hidden @[48rem]:table-header-group">
  <TableBody className="block ... @[48rem]:table-row-group">
    <TableRow className="block ... @[48rem]:table-row">
      <TableCell className="flex ... @[48rem]:table-cell">`,
  },
  {
    title: "It's a container query, not a viewport breakpoint",
    description:
      "@[48rem] is Tailwind v4's container-query variant, keyed to the nearest ancestor with @container — here, the table's own wrapper div — instead of the browser viewport. A table embedded in a narrow sidebar or split-pane gets the card layout even on a wide desktop screen, and a table given more room stays a table even on a small one.",
    file: 'src/components/mobile-cards/data-table.tsx',
    code: `<div className="@container rounded-md border">
  <Table className="block @[48rem]:table">
    {/* @[48rem] reacts to this div's width, not window width */}
  </Table>
</div>`,
  },
  {
    title: 'The header disappears; its text moves onto the cell as a data attribute',
    description:
      "hidden @[48rem]:table-header-group removes the header row visually below the breakpoint (screen readers still get context from data-label). Each TableCell carries its own column header as data-label — that's the one piece of information a headerless card still needs per field.",
    file: 'src/components/mobile-cards/data-table.tsx',
    code: `const header = cell.column.columnDef.header
const label = typeof header === 'string' ? header : undefined

<TableCell data-label={label}>`,
  },
  {
    title: 'A pseudo-element renders the label — and disappears above the breakpoint',
    description:
      'before:content-[attr(data-label)] pulls that data-label straight into CSS generated content, so the label renders without any extra DOM node. @[48rem]:before:content-none removes it again once the real <thead> is doing that job instead.',
    file: 'src/components/mobile-cards/data-table.tsx',
    code: `className={cn(
  'flex items-center justify-between gap-4 py-1 @[48rem]:table-cell @[48rem]:py-3',
  'before:content-[attr(data-label)] before:text-xs before:text-muted-foreground',
  '@[48rem]:before:content-none',
)}`,
  },
  {
    title: 'The first column is styled as the card title, not another label:value row',
    description:
      'cellIndex === 0 renders the first cell (the order id) without a data-label prefix and in a slightly heavier weight, so each card reads top-to-bottom the way a real mobile UI would: an identifying line first, then attribute rows underneath — instead of every field looking identical.',
    file: 'src/components/mobile-cards/data-table.tsx',
    code: `const isPrimary = cellIndex === 0

className={isPrimary
  ? 'mb-1 text-sm font-medium @[48rem]:mb-0 @[48rem]:font-normal'
  : 'before:content-[attr(data-label)] ...'}`,
  },
  {
    title: 'A Mobile/Desktop tab forces the container width, not the browser',
    description:
      "Since the transform keys off @container width, testing it doesn't require resizing the whole window. Mobile pins the demo to a fixed 375px box; Desktop sets a 900px min-width — a min-width, not just 100%, because the docs sidebar can leave the preview pane narrower than the table's own 768px breakpoint. Forcing the simulated width (with horizontal scroll if the pane is tighter) is what a device-preview tab is supposed to do.",
    file: 'src/components/mobile-cards/viewport-toggle.tsx',
    code: `<Tabs value={view} onValueChange={(v) => setView(v as View)}>
  <TabsList>
    <TabsTrigger value="mobile">Mobile</TabsTrigger>
    <TabsTrigger value="desktop">Desktop</TabsTrigger>
  </TabsList>
</Tabs>
<div className="overflow-x-auto">
  <div
    style={
      view === 'mobile'
        ? { width: 375, maxWidth: '100%' }
        : { minWidth: 900 }
    }
  >
    {children}
  </div>
</div>`,
  },
]

export const Route = createFileRoute('/mobile-cards-table')({
  head: () => ({
    meta: [
      { title: 'Mobile Cards Table — ShadTable' },
      {
        name: 'description',
        content:
          'A data table that transforms into stacked cards below a container-query breakpoint using pure CSS display overrides — no separate mobile component, no JS media query, no viewport dependency.',
      },
      { property: 'og:title', content: 'Mobile Cards Table — ShadTable' },
      {
        property: 'og:description',
        content:
          'A responsive data table that becomes a card list when its own container narrows, built on shadcn/ui, TanStack Table, and Tailwind container queries.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Mobile Cards Table',
          description:
            'A data table that transforms into stacked cards below a container-query breakpoint, using CSS display overrides instead of a separate mobile component.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
        },
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://shad-table.dev/mobile-cards-table',
      },
    ],
  }),
  component: MobileCardsTablePage,
})

function MobileCardsTablePage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Mobile Cards Table
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Switch the Mobile/Desktop tab below — each row becomes its own
            card with labeled fields once the container narrows past
            768px, no horizontal scrolling required. It's a container
            query, not a viewport breakpoint, so it works wherever the
            table is embedded — no separate mobile component, no JS
            media-query hook.
          </p>
        </div>

        <InstallCommand name="mobile-cards-table" />

        <ComponentPreview preview={<MobileCardsTableDemo />} files={files} />

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
