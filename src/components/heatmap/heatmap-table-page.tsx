import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import heatmapSource from './heatmap.ts?raw'
import dataSource from './data.ts?raw'
import tableSource from './data-table.tsx?raw'
import demoSource from './index.tsx?raw'
import { HeatmapTableDemo } from './index'

const files = [
  { path: 'src/components/heatmap/heatmap.ts', code: heatmapSource },
  { path: 'src/components/heatmap/data.ts', code: dataSource },
  { path: 'src/components/heatmap/data-table.tsx', code: tableSource },
  { path: 'src/components/heatmap/index.tsx', code: demoSource },
]

const steps = [
  {
    title: 'Color intensity comes from one min/max pass over the whole matrix',
    description:
      "getHeatmapRange scans every row × column once to find the matrix's global minimum and maximum. With just those two numbers, a single getHeatColor(value, min, max) call can turn any cell's raw revenue figure into a comparable alpha value — the same function runs for all 24 cells in the demo.",
    file: 'src/components/heatmap/heatmap.ts',
    code: `export function getHeatmapRange(rows: HeatmapRow[], columns: string[]) {
  let min = Infinity
  let max = -Infinity
  for (const row of rows) {
    for (const col of columns) {
      const value = row.values[col]
      if (value < min) min = value
      if (value > max) max = value
    }
  }
  return { min, max }
}`,
  },
  {
    title: 'Normalized globally, not per row',
    description:
      "Because min/max come from the whole matrix rather than being recomputed for each row, South's uniformly lower revenue reads as uniformly light and East's uniformly higher revenue reads as uniformly dark. Normalizing per row instead would make every row's own max look equally dark regardless of how the rows compare to each other — exactly the pattern a heatmap exists to show.",
    file: 'src/components/heatmap/data-table.tsx',
    code: `const { min, max } = useMemo(
  () => getHeatmapRange(data, columns), // scans the full matrix, not one row
  [data, columns],
)`,
  },
  {
    title: 'The color fills a div inside the cell, not the TableCell itself',
    description:
      "Value TableCells get p-0, and an inner div stretches to h-full w-full with its own padding. That lets the color block fill the entire cell edge-to-edge — if the color were applied straight to TableCell, the table's default cell padding would leave a colorless margin around every value.",
    file: 'src/components/heatmap/data-table.tsx',
    code: `<TableCell className={cn(cell.column.id === 'label' ? undefined : 'p-0 text-center')}>
  {/* cell renders: */}
  <div style={{ backgroundColor }} className="flex h-full w-full items-center justify-center px-3 py-2.5">
    {formatValue(value)}
  </div>
</TableCell>`,
  },
  {
    title: 'Text flips to white once the background gets dark enough',
    description:
      "getHeatColor also returns isDark, true once the computed alpha crosses a fixed threshold. Cells past that threshold render with text-white instead of the default foreground color, so high-value cells (East in June, the darkest cell) stay legible instead of dark text disappearing into a dark background.",
    file: 'src/components/heatmap/heatmap.ts',
    code: `export function getHeatColor(value: number, min: number, max: number) {
  const range = max - min || 1
  const alpha = MIN_ALPHA + ((value - min) / range) * (MAX_ALPHA - MIN_ALPHA)
  return {
    backgroundColor: \`rgba(\${HEAT_RGB}, \${alpha.toFixed(2)})\`,
    isDark: alpha > DARK_TEXT_THRESHOLD,
  }
}`,
  },
  {
    title: 'The legend reuses the exact same color function as the cells',
    description:
      "The gradient bar under the table calls getHeatColor(min, min, max) and getHeatColor(max, min, max) — the same function every cell uses — rather than hand-picking two colors that merely look similar. The legend can't drift out of sync with what a shade actually means in the table above it, because it's computed from the same code path.",
    file: 'src/components/heatmap/data-table.tsx',
    code: `const legendLow = getHeatColor(min, min, max).backgroundColor
const legendHigh = getHeatColor(max, min, max).backgroundColor
// ...
style={{ background: \`linear-gradient(to right, \${legendLow}, \${legendHigh})\` }}`,
  },
]

export function HeatmapTablePage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Heatmap Table
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Revenue by region and month, with each cell's background
            intensity mapped to its value — good for spotting patterns
            across a matrix at a glance rather than reading numbers one by
            one.
          </p>
        </div>

        <InstallCommand name="heatmap-table" />

        <ComponentPreview preview={<HeatmapTableDemo />} files={files} />

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
