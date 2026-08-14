import { createFileRoute } from '@tanstack/react-router'
import { ConditionalFormattingTableDemo } from '#/components/conditional-formatting'
import indexSource from '#/components/conditional-formatting/index.tsx?raw'
import columnsSource from '#/components/conditional-formatting/columns.tsx?raw'
import dataTableSource from '#/components/conditional-formatting/data-table.tsx?raw'
import rulesSource from '#/components/conditional-formatting/rules.ts?raw'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'

const files = [
  { path: 'src/components/conditional-formatting/index.tsx', code: indexSource },
  { path: 'src/components/conditional-formatting/columns.tsx', code: columnsSource },
  {
    path: 'src/components/conditional-formatting/data-table.tsx',
    code: dataTableSource,
  },
  { path: 'src/components/conditional-formatting/rules.ts', code: rulesSource },
]

const steps = [
  {
    title: 'A rule is just a predicate plus a className',
    description:
      "matchRule takes a row and a list of { test, className } rules and returns the first one whose test passes — that's the entire engine. There's no rule-parsing DSL or condition builder; a rule is just a plain JS function, so anything you can express in TypeScript (comparing two fields, checking a date range, matching a string) is a valid rule.",
    file: 'src/components/conditional-formatting/rules.ts',
    code: `export interface FormatRule<TData> {
  test: (row: TData) => boolean
  className: string
  label?: string
}

export function matchRule<TData>(row: TData, rules: FormatRule<TData>[]) {
  return rules.find((rule) => rule.test(row))
}`,
  },
  {
    title: 'Rules see the whole row, not just their own cell',
    description:
      "test receives the full row, not the cell's value in isolation — that's what lets the Stock column flag a row as low without a separate 'reorder point' column doing anything special. Excel's conditional formatting is usually single-cell; cross-field comparisons like stock < reorderPoint are exactly the case that trips up naive per-value implementations.",
    file: 'src/components/conditional-formatting/columns.tsx',
    code: `const stockRules: FormatRule<InventoryItem>[] = [
  { test: (row) => row.stock === 0, className: '...', label: 'Out of stock' },
  { test: (row) => row.stock < row.reorderPoint, className: '...', label: 'Below reorder point' },
]`,
  },
  {
    title: 'Order matters — first match wins, most specific first',
    description:
      "Every row with 0 stock also satisfies stock < reorderPoint, so if the low-stock rule came first, an out-of-stock row would just look like a regular low-stock row. Listing 'out of stock' before 'below reorder point' is what keeps the more urgent condition from getting silently masked by the more general one.",
    file: 'src/components/conditional-formatting/columns.tsx',
    code: `// 0 stock also satisfies "< reorderPoint" — order is the guard, not a
// clever predicate. This has to come first:
{ test: (row) => row.stock === 0, className: '...' },
{ test: (row) => row.stock < row.reorderPoint, className: '...' },`,
  },
  {
    title: 'The same engine drives three visually different treatments',
    description:
      'Stock renders a full pill background with an icon, Margin renders colored text only, and Status renders a Badge with its variant color overridden — three different visual languages, but all three cells call the same matchRule and just decide what to do with the className differently. The formatting logic never has to know how its result will be displayed.',
    file: 'src/components/conditional-formatting/columns.tsx',
    code: `// Stock — full-bleed pill
<div className={cn('rounded px-2 py-1', rule?.className)}>

// Margin — text color only
<span className={cn('tabular-nums', rule?.className)}>

// Status — Badge, variant color replaced by the rule
<Badge variant="outline" className={cn('border-transparent', rule?.className)}>`,
  },
  {
    title: 'No match is a valid, silent outcome',
    description:
      "matchRule returns undefined when nothing matches, and every cell handles that with cn(..., rule?.className) — undefined is simply dropped from the class list. A healthy row (in stock, decent margin, active status) needs zero special-case code; it just renders with no rule applied, which is the correct default for conditional formatting.",
    file: 'src/components/conditional-formatting/columns.tsx',
    code: `const rule = matchRule(row.original, marginRules)
// rule is undefined for anything between 10% and 30% margin
<span className={cn('tabular-nums', rule?.className)}>
  {row.original.marginPct.toFixed(1)}%
</span>`,
  },
]

export const Route = createFileRoute('/conditional-formatting-table')({
  head: () => ({
    meta: [
      { title: 'Conditional Formatting Table — ShadTable' },
      {
        name: 'description',
        content:
          'Excel-style conditional formatting: a small rule engine highlights cells, colors text, and re-colors badges based on the row data, not just a single value.',
      },
      {
        property: 'og:title',
        content: 'Conditional Formatting Table — ShadTable',
      },
      {
        property: 'og:description',
        content:
          'A data table with rule-based cell formatting for inventory/finance-style dashboards, built on shadcn/ui and TanStack Table.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Conditional Formatting Table',
          description:
            'A data table with a small rule engine that highlights cells, colors text, and re-colors badges based on row data.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
        },
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://shad-table.dev/conditional-formatting-table',
      },
    ],
  }),
  component: ConditionalFormattingTablePage,
})

function ConditionalFormattingTablePage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Conditional Formatting Table
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Excel-style conditional formatting — a small, reusable rule
            engine highlights out-of-stock rows, colors margin percentages,
            and re-colors status badges, all driven by the same
            row-level rules instead of one-off logic per column.
          </p>
        </div>

        <InstallCommand name="conditional-formatting-table" />

        <ComponentPreview
          preview={<ConditionalFormattingTableDemo />}
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
