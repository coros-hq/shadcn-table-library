import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import schemaSource from './schema.ts?raw'
import csvSource from './csv.ts?raw'
import reviewSource from './review.ts?raw'
import sampleSource from './sample.ts?raw'
import reviewCellSource from './review-cell.tsx?raw'
import mappingSelectSource from './mapping-select.tsx?raw'
import columnsSource from './columns.tsx?raw'
import dataTableSource from './data-table.tsx?raw'
import indexSource from './index.tsx?raw'
import { CsvImportDemo } from './index'
import vueCsvImportDemoVueSource from '#/components/vue/csv-import/CsvImportDemo.vue?raw'
import vueReviewTableVueSource from '#/components/vue/csv-import/ReviewTable.vue?raw'
import vueColumnsTsSource from '#/components/vue/csv-import/columns.ts?raw'
import vueReviewCellVueSource from '#/components/vue/csv-import/ReviewCell.vue?raw'
import vueMappingSelectVueSource from '#/components/vue/csv-import/MappingSelect.vue?raw'
import vueReviewTsSource from '#/components/vue/csv-import/review.ts?raw'
import vueSchemaTsSource from '#/components/vue/csv-import/schema.ts?raw'
import vueCsvTsSource from '#/components/vue/csv-import/csv.ts?raw'
import vueSampleTsSource from '#/components/vue/csv-import/sample.ts?raw'
import svelteCsvImportDemoSvelteSource from '#/components/svelte/csv-import/CsvImportDemo.svelte?raw'
import svelteReviewTableSvelteSource from '#/components/svelte/csv-import/ReviewTable.svelte?raw'
import svelteColumnsTsSource from '#/components/svelte/csv-import/columns.ts?raw'
import svelteReviewCellSvelteSource from '#/components/svelte/csv-import/ReviewCell.svelte?raw'
import svelteMappingSelectSvelteSource from '#/components/svelte/csv-import/MappingSelect.svelte?raw'
import svelteIncludeCheckboxSvelteSource from '#/components/svelte/csv-import/IncludeCheckbox.svelte?raw'
import svelteStatusBadgeSvelteSource from '#/components/svelte/csv-import/StatusBadge.svelte?raw'
import svelteTextCellSvelteSource from '#/components/svelte/csv-import/TextCell.svelte?raw'
import svelteReviewTsSource from '#/components/svelte/csv-import/review.ts?raw'
import svelteSchemaTsSource from '#/components/svelte/csv-import/schema.ts?raw'
import svelteCsvTsSource from '#/components/svelte/csv-import/csv.ts?raw'
import svelteSampleTsSource from '#/components/svelte/csv-import/sample.ts?raw'

const files = [
  { path: 'src/components/csv-import/schema.ts', code: schemaSource },
  { path: 'src/components/csv-import/csv.ts', code: csvSource },
  { path: 'src/components/csv-import/review.ts', code: reviewSource },
  { path: 'src/components/csv-import/sample.ts', code: sampleSource },
  {
    path: 'src/components/csv-import/review-cell.tsx',
    code: reviewCellSource,
  },
  {
    path: 'src/components/csv-import/mapping-select.tsx',
    code: mappingSelectSource,
  },
  { path: 'src/components/csv-import/columns.tsx', code: columnsSource },
  { path: 'src/components/csv-import/data-table.tsx', code: dataTableSource },
  { path: 'src/components/csv-import/index.tsx', code: indexSource },
]

const vueFiles = [
  {
    path: 'src/components/csv-import/CsvImportDemo.vue',
    code: vueCsvImportDemoVueSource,
  },
  {
    path: 'src/components/csv-import/ReviewTable.vue',
    code: vueReviewTableVueSource,
  },
  { path: 'src/components/csv-import/columns.ts', code: vueColumnsTsSource },
  {
    path: 'src/components/csv-import/ReviewCell.vue',
    code: vueReviewCellVueSource,
  },
  {
    path: 'src/components/csv-import/MappingSelect.vue',
    code: vueMappingSelectVueSource,
  },
  { path: 'src/components/csv-import/review.ts', code: vueReviewTsSource },
  { path: 'src/components/csv-import/schema.ts', code: vueSchemaTsSource },
  { path: 'src/components/csv-import/csv.ts', code: vueCsvTsSource },
  { path: 'src/components/csv-import/sample.ts', code: vueSampleTsSource },
]

const vueDeps = {
  npm: ['@lucide/vue'],
  shadcn: [
    'badge',
    'button',
    'checkbox',
    'input',
    'select',
    'table',
    'tooltip',
  ],
  valueUpdater: false,
}

const svelteFiles = [
  {
    path: 'src/lib/components/csv-import/CsvImportDemo.svelte',
    code: svelteCsvImportDemoSvelteSource,
  },
  {
    path: 'src/lib/components/csv-import/ReviewTable.svelte',
    code: svelteReviewTableSvelteSource,
  },
  {
    path: 'src/lib/components/csv-import/columns.ts',
    code: svelteColumnsTsSource,
  },
  {
    path: 'src/lib/components/csv-import/ReviewCell.svelte',
    code: svelteReviewCellSvelteSource,
  },
  {
    path: 'src/lib/components/csv-import/MappingSelect.svelte',
    code: svelteMappingSelectSvelteSource,
  },
  {
    path: 'src/lib/components/csv-import/IncludeCheckbox.svelte',
    code: svelteIncludeCheckboxSvelteSource,
  },
  {
    path: 'src/lib/components/csv-import/StatusBadge.svelte',
    code: svelteStatusBadgeSvelteSource,
  },
  {
    path: 'src/lib/components/csv-import/TextCell.svelte',
    code: svelteTextCellSvelteSource,
  },
  {
    path: 'src/lib/components/csv-import/review.ts',
    code: svelteReviewTsSource,
  },
  {
    path: 'src/lib/components/csv-import/schema.ts',
    code: svelteSchemaTsSource,
  },
  {
    path: 'src/lib/components/csv-import/csv.ts',
    code: svelteCsvTsSource,
  },
  {
    path: 'src/lib/components/csv-import/sample.ts',
    code: svelteSampleTsSource,
  },
]

const svelteDeps = {
  npm: ['@lucide/svelte'],
  shadcn: [
    'badge',
    'button',
    'checkbox',
    'input',
    'select',
    'table',
    'tooltip',
  ],
  adapter: true,
}

const steps = [
  {
    title: 'The table has the file’s columns, not your schema’s',
    description:
      'Columns are built from the CSV header, and each header holds a select for the field it imports into. autoMap() matches headers like "E-mail Address" or "Licenses" by alias. Picking a field that another column already uses moves it, so a field is never imported twice. Columns set to "Don\'t import" stay visible, greyed out, for context.',
    file: 'src/components/csv-import/review.ts',
    code: `export const assign = (mapping, column, field) =>
  mapping.map((current, i) =>
    i === column ? field : field && current === field ? null : current,
  )`,
  },
  {
    title: 'One schema drives mapping, validation and the import',
    description:
      'Each field declares its aliases, a validate() that returns a message, and a normalize() that produces the imported value. To import products instead of customers, replace the fields array; nothing else changes.',
    file: 'src/components/csv-import/schema.ts',
    code: `{
  id: 'plan',
  required: true,
  aliases: ['plan', 'tier', 'subscription'],
  validate: (v) => plans.some((p) => p.toLowerCase() === v.trim().toLowerCase())
    ? null : 'Plan must be Free, Pro or Enterprise',
  normalize: (v) => plans.find((p) => p.toLowerCase() === v.trim().toLowerCase()),
}`,
  },
  {
    title: 'Edits change the raw file, and the review runs again',
    description:
      'Fixing a cell writes into the CSV rows themselves, and review() is a useMemo over the file, the mapping and the skipped rows. A fix therefore survives remapping, and the row id is its position in the file, so editing never moves it.',
    file: 'src/components/csv-import/index.tsx',
    code: `const rows = useMemo(
  () => review(file.csv, file.mapping, skipped),
  [file, skipped],
)`,
  },
  {
    title: 'Duplicates are checked in the file and against existing records',
    description:
      'Emails are compared case-insensitively. The first copy in the file wins and later ones point back to its line. Emails that already belong to a customer are flagged as well. Skipped rows don’t count, so skipping the first copy clears the second.',
    file: 'src/components/csv-import/review.ts',
    code: `if (existingEmails.has(email)) issue('Already a customer in this workspace')
else if (first !== undefined) issue(\`Same email as line \${first}\`)
else firstLineByEmail.set(email, line)`,
  },
  {
    title: 'Only ready rows are imported',
    description:
      'Rows with problems never block the rest: the import button counts ready rows, and "Needs fixing" filters the table down to what is left. Skip a row, or every row with problems at once, to leave it out on purpose.',
    file: 'src/components/csv-import/review.ts',
    code: `export const toRecords = (rows, mapping) =>
  rows.filter((row) => row.status === 'ready').map(normalizeRow)`,
  },
]

export function CsvImportTablePage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-normal tracking-tight text-balance sm:text-4xl">
            Shadcn CSV Import Review Table
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground text-balance">
            Check a CSV before it becomes data: map its columns to your fields,
            see invalid cells and duplicate emails highlighted in place, fix
            them inline or skip the row, then import only what is ready.
          </p>
        </div>

        <InstallCommand name="csv-import-table" />

        <ComponentPreview
          preview={<CsvImportDemo />}
          files={files}
          vueFiles={vueFiles}
          svelteFiles={svelteFiles}
          svelteDeps={svelteDeps}
          vueDeps={vueDeps}
        />

        <div className="space-y-4">
          <h2 className="text-xl font-medium tracking-tight">How it works</h2>
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
