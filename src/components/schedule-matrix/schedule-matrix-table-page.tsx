import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import dataSource from './data.ts?raw'
import scheduleSource from './schedule.ts?raw'
import shiftCellSource from './shift-cell.tsx?raw'
import columnsSource from './columns.tsx?raw'
import dataTableSource from './data-table.tsx?raw'
import indexSource from './index.tsx?raw'
import { ScheduleMatrixDemo } from './index'
import vueScheduleMatrixDemoVueSource from '#/components/vue/schedule-matrix/ScheduleMatrixDemo.vue?raw'
import vueScheduleTableVueSource from '#/components/vue/schedule-matrix/ScheduleTable.vue?raw'
import vueColumnsTsSource from '#/components/vue/schedule-matrix/columns.ts?raw'
import vueShiftCellVueSource from '#/components/vue/schedule-matrix/ShiftCell.vue?raw'
import vueShiftChipVueSource from '#/components/vue/schedule-matrix/ShiftChip.vue?raw'
import vueToneTsSource from '#/components/vue/schedule-matrix/tone.ts?raw'
import vueScheduleTsSource from '#/components/vue/schedule-matrix/schedule.ts?raw'
import vueDataTsSource from '#/components/vue/schedule-matrix/data.ts?raw'
import svelteScheduleMatrixDemoSvelteSource from '#/components/svelte/schedule-matrix/ScheduleMatrixDemo.svelte?raw'
import svelteScheduleTableSvelteSource from '#/components/svelte/schedule-matrix/ScheduleTable.svelte?raw'
import svelteColumnsTsSource from '#/components/svelte/schedule-matrix/columns.ts?raw'
import svelteShiftCellSvelteSource from '#/components/svelte/schedule-matrix/ShiftCell.svelte?raw'
import svelteShiftChipSvelteSource from '#/components/svelte/schedule-matrix/ShiftChip.svelte?raw'
import svelteCoverageSvelteSource from '#/components/svelte/schedule-matrix/Coverage.svelte?raw'
import svelteHoursCellSvelteSource from '#/components/svelte/schedule-matrix/HoursCell.svelte?raw'
import sveltePersonCellSvelteSource from '#/components/svelte/schedule-matrix/PersonCell.svelte?raw'
import svelteDayHeaderSvelteSource from '#/components/svelte/schedule-matrix/DayHeader.svelte?raw'
import svelteRightLabelSvelteSource from '#/components/svelte/schedule-matrix/RightLabel.svelte?raw'
import svelteToneTsSource from '#/components/svelte/schedule-matrix/tone.ts?raw'
import svelteScheduleTsSource from '#/components/svelte/schedule-matrix/schedule.ts?raw'
import svelteDataTsSource from '#/components/svelte/schedule-matrix/data.ts?raw'

const files = [
  { path: 'src/components/schedule-matrix/data.ts', code: dataSource },
  { path: 'src/components/schedule-matrix/schedule.ts', code: scheduleSource },
  {
    path: 'src/components/schedule-matrix/shift-cell.tsx',
    code: shiftCellSource,
  },
  { path: 'src/components/schedule-matrix/columns.tsx', code: columnsSource },
  {
    path: 'src/components/schedule-matrix/data-table.tsx',
    code: dataTableSource,
  },
  { path: 'src/components/schedule-matrix/index.tsx', code: indexSource },
]

const vueFiles = [
  {
    path: 'src/components/schedule-matrix/ScheduleMatrixDemo.vue',
    code: vueScheduleMatrixDemoVueSource,
  },
  {
    path: 'src/components/schedule-matrix/ScheduleTable.vue',
    code: vueScheduleTableVueSource,
  },
  {
    path: 'src/components/schedule-matrix/columns.ts',
    code: vueColumnsTsSource,
  },
  {
    path: 'src/components/schedule-matrix/ShiftCell.vue',
    code: vueShiftCellVueSource,
  },
  {
    path: 'src/components/schedule-matrix/ShiftChip.vue',
    code: vueShiftChipVueSource,
  },
  {
    path: 'src/components/schedule-matrix/tone.ts',
    code: vueToneTsSource,
  },
  {
    path: 'src/components/schedule-matrix/schedule.ts',
    code: vueScheduleTsSource,
  },
  {
    path: 'src/components/schedule-matrix/data.ts',
    code: vueDataTsSource,
  },
]

const vueDeps = {
  npm: ['@lucide/vue'],
  shadcn: ['button', 'popover', 'table'],
  valueUpdater: false,
}

const svelteFiles = [
  {
    path: 'src/lib/components/schedule-matrix/ScheduleMatrixDemo.svelte',
    code: svelteScheduleMatrixDemoSvelteSource,
  },
  {
    path: 'src/lib/components/schedule-matrix/ScheduleTable.svelte',
    code: svelteScheduleTableSvelteSource,
  },
  {
    path: 'src/lib/components/schedule-matrix/columns.ts',
    code: svelteColumnsTsSource,
  },
  {
    path: 'src/lib/components/schedule-matrix/ShiftCell.svelte',
    code: svelteShiftCellSvelteSource,
  },
  {
    path: 'src/lib/components/schedule-matrix/ShiftChip.svelte',
    code: svelteShiftChipSvelteSource,
  },
  {
    path: 'src/lib/components/schedule-matrix/Coverage.svelte',
    code: svelteCoverageSvelteSource,
  },
  {
    path: 'src/lib/components/schedule-matrix/HoursCell.svelte',
    code: svelteHoursCellSvelteSource,
  },
  {
    path: 'src/lib/components/schedule-matrix/PersonCell.svelte',
    code: sveltePersonCellSvelteSource,
  },
  {
    path: 'src/lib/components/schedule-matrix/DayHeader.svelte',
    code: svelteDayHeaderSvelteSource,
  },
  {
    path: 'src/lib/components/schedule-matrix/RightLabel.svelte',
    code: svelteRightLabelSvelteSource,
  },
  {
    path: 'src/lib/components/schedule-matrix/tone.ts',
    code: svelteToneTsSource,
  },
  {
    path: 'src/lib/components/schedule-matrix/schedule.ts',
    code: svelteScheduleTsSource,
  },
  {
    path: 'src/lib/components/schedule-matrix/data.ts',
    code: svelteDataTsSource,
  },
]

const svelteDeps = {
  npm: ['@lucide/svelte'],
  shadcn: ['button', 'popover', 'table'],
  adapter: true,
}

const steps = [
  {
    title: 'One column per day, generated',
    description:
      'The days array becomes seven columns with the same cell and footer. Each cell reads its person and day from the schedule in table meta, so editing a shift never rebuilds the columns. For room allocation, make the rows rooms and the columns time slots; nothing else changes.',
    file: 'src/components/schedule-matrix/columns.tsx',
    code: `...days.map((d, day) => ({
  id: d.id,
  cell: ({ row, table }) => <ShiftCell value={getMeta(table).schedule[row.original.id][day]} … />,
  footer: ({ table }) => <Coverage have={coverage(getMeta(table).schedule, day)} need={required(d)} />,
}))`,
  },
  {
    title: 'Click to pick, or type the letter',
    description:
      'A cell opens a small popover with every shift and Off. From the keyboard, the arrow keys move between cells and typing E, L, N or A assigns that shift and moves to the next day, so a week can be typed in one go. Delete clears a cell. Only the current cell is in the tab order, so Tab leaves the grid instead of stopping 56 times.',
    file: 'src/components/schedule-matrix/data-table.tsx',
    code: `const value = fromKey(event.key)
if (value === undefined) return
assign(personId, day, value)
if (value !== null) focusCell(row, day + 1)`,
  },
  {
    title: 'Rules are checked as you edit',
    description:
      'The footer counts who is on each shift against what that day needs, and goes red when a shift is short. A shift that starts less than 11 hours after the one before gets a red outline, and the Hours column compares the week with the contract. All three are plain functions of the schedule.',
    file: 'src/components/schedule-matrix/schedule.ts',
    code: `export function restBefore(week: Assignment[], day: number) {
  const prev = week[day - 1]
  const next = week[day]
  if (!prev || !next || prev === 'leave' || next === 'leave') return null
  return 24 + shiftById[next].start - shiftById[prev].end
}`,
  },
  {
    title: 'Draft, then publish',
    description:
      'Edits change a draft. Cells that differ from the published schedule get a blue dot, and Publish or Discard settles all of them at once, so people are not notified about every click.',
    file: 'src/components/schedule-matrix/index.tsx',
    code: `const changed = useMemo(() => changes(published, schedule), [published, schedule])`,
  },
]

export function ScheduleMatrixTablePage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-normal tracking-tight sm:text-4xl">
            Shadcn Schedule Matrix Table
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground text-balance">
            People down the side, days across the top and a shift in every cell.
            Assign with a click or the keyboard, and see short-staffed shifts,
            too little rest and overtime while you edit.
          </p>
        </div>

        <InstallCommand name="schedule-matrix-table" />

        <ComponentPreview
          preview={<ScheduleMatrixDemo />}
          files={files}
          vueFiles={vueFiles}
          svelteFiles={svelteFiles}
          svelteDeps={svelteDeps}
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
