import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import dataSource from './data.ts?raw'
import permissionsSource from './permissions.ts?raw'
import checkboxSource from './permission-checkbox.tsx?raw'
import columnsSource from './columns.tsx?raw'
import dataTableSource from './data-table.tsx?raw'
import indexSource from './index.tsx?raw'
import { PermissionsMatrixDemo } from './index'
import vuePermissionsMatrixDemoVueSource from '#/components/vue/permissions-matrix/PermissionsMatrixDemo.vue?raw'
import vuePermissionsTableVueSource from '#/components/vue/permissions-matrix/PermissionsTable.vue?raw'
import vueColumnsTsSource from '#/components/vue/permissions-matrix/columns.ts?raw'
import vuePermissionCheckboxVueSource from '#/components/vue/permissions-matrix/PermissionCheckbox.vue?raw'
import vueSummaryCheckboxVueSource from '#/components/vue/permissions-matrix/SummaryCheckbox.vue?raw'
import vuePermissionsTsSource from '#/components/vue/permissions-matrix/permissions.ts?raw'
import vueDataTsSource from '#/components/vue/permissions-matrix/data.ts?raw'
import sveltePermissionsMatrixDemoSvelteSource from '#/components/svelte/permissions-matrix/PermissionsMatrixDemo.svelte?raw'
import sveltePermissionsTableSvelteSource from '#/components/svelte/permissions-matrix/PermissionsTable.svelte?raw'
import svelteColumnsTsSource from '#/components/svelte/permissions-matrix/columns.ts?raw'
import sveltePermissionCheckboxSvelteSource from '#/components/svelte/permissions-matrix/PermissionCheckbox.svelte?raw'
import svelteSummaryCheckboxSvelteSource from '#/components/svelte/permissions-matrix/SummaryCheckbox.svelte?raw'
import svelteResourceCellSvelteSource from '#/components/svelte/permissions-matrix/ResourceCell.svelte?raw'
import sveltePermissionsTsSource from '#/components/svelte/permissions-matrix/permissions.ts?raw'
import svelteDataTsSource from '#/components/svelte/permissions-matrix/data.ts?raw'

const files = [
  { path: 'src/components/permissions-matrix/data.ts', code: dataSource },
  {
    path: 'src/components/permissions-matrix/permissions.ts',
    code: permissionsSource,
  },
  {
    path: 'src/components/permissions-matrix/permission-checkbox.tsx',
    code: checkboxSource,
  },
  {
    path: 'src/components/permissions-matrix/columns.tsx',
    code: columnsSource,
  },
  {
    path: 'src/components/permissions-matrix/data-table.tsx',
    code: dataTableSource,
  },
  { path: 'src/components/permissions-matrix/index.tsx', code: indexSource },
]

const vueFiles = [
  {
    path: 'src/components/permissions-matrix/PermissionsMatrixDemo.vue',
    code: vuePermissionsMatrixDemoVueSource,
  },
  {
    path: 'src/components/permissions-matrix/PermissionsTable.vue',
    code: vuePermissionsTableVueSource,
  },
  {
    path: 'src/components/permissions-matrix/columns.ts',
    code: vueColumnsTsSource,
  },
  {
    path: 'src/components/permissions-matrix/PermissionCheckbox.vue',
    code: vuePermissionCheckboxVueSource,
  },
  {
    path: 'src/components/permissions-matrix/SummaryCheckbox.vue',
    code: vueSummaryCheckboxVueSource,
  },
  {
    path: 'src/components/permissions-matrix/permissions.ts',
    code: vuePermissionsTsSource,
  },
  { path: 'src/components/permissions-matrix/data.ts', code: vueDataTsSource },
]

const vueDeps = {
  npm: ['@lucide/vue'],
  shadcn: ['button', 'checkbox', 'table', 'tooltip'],
  valueUpdater: true,
}

const svelteFiles = [
  {
    path: 'src/lib/components/permissions-matrix/PermissionsMatrixDemo.svelte',
    code: sveltePermissionsMatrixDemoSvelteSource,
  },
  {
    path: 'src/lib/components/permissions-matrix/PermissionsTable.svelte',
    code: sveltePermissionsTableSvelteSource,
  },
  {
    path: 'src/lib/components/permissions-matrix/columns.ts',
    code: svelteColumnsTsSource,
  },
  {
    path: 'src/lib/components/permissions-matrix/PermissionCheckbox.svelte',
    code: sveltePermissionCheckboxSvelteSource,
  },
  {
    path: 'src/lib/components/permissions-matrix/SummaryCheckbox.svelte',
    code: svelteSummaryCheckboxSvelteSource,
  },
  {
    path: 'src/lib/components/permissions-matrix/ResourceCell.svelte',
    code: svelteResourceCellSvelteSource,
  },
  {
    path: 'src/lib/components/permissions-matrix/permissions.ts',
    code: sveltePermissionsTsSource,
  },
  {
    path: 'src/lib/components/permissions-matrix/data.ts',
    code: svelteDataTsSource,
  },
]

const svelteDeps = {
  npm: ['@lucide/svelte'],
  shadcn: ['button', 'checkbox', 'table', 'tooltip'],
  adapter: true,
}

const steps = [
  {
    title: 'Only grants are stored; every other state is derived',
    description:
      "Each role keeps a set of its own grants, like 'invoices.export'. Whether a checkbox is inherited, required or unavailable is worked out by cellState() on every render. Grant Delete on the Editor tab and Admin shows it as inherited straight away, because nothing was copied that could go stale.",
    file: 'src/components/permissions-matrix/permissions.ts',
    code: `if (!resource.actions.includes(action)) return { kind: 'unavailable' }
if (role.locked) return { kind: 'locked', role }
const from = inheritedFrom(role, k, grants)
if (from) return { kind: 'inherited', from }
if (!own.has(k)) return { kind: 'denied' }`,
  },
  {
    title: 'Inherited means "on, but changed somewhere else"',
    description:
      'An inherited grant is checked and disabled, with a muted fill instead of the solid one, so the matrix shows at a glance what this role adds on top of its parent. The tooltip names the role it comes from. Disabled buttons get no pointer events, so the tooltip hangs on a wrapper span.',
    file: 'src/components/permissions-matrix/permission-checkbox.tsx',
    code: `<Tooltip>
  <TooltipTrigger asChild>
    <span className="inline-flex">{checkbox}</span>
  </TooltipTrigger>
  <TooltipContent>Inherited from {state.from.name}</TooltipContent>
</Tooltip>`,
  },
  {
    title: 'Every action needs View',
    description:
      "Granting Edit also grants View. While Edit, Create or Delete is on, View is locked with a 'Needed by Edit' tooltip rather than letting the role end up able to edit something it can't see. setCells() applies the same rule to bulk changes.",
    file: 'src/components/permissions-matrix/permissions.ts',
    code: `const needsView = resource.actions.some(
  (a) => a !== 'view' && next.has(key(resource.id, a)),
)
if (needsView && !viewInherited) next.add(viewKey)`,
  },
  {
    title: 'Group, column and row checkboxes are tri-state',
    description:
      "Resources are subRows of their group, so groups expand and collapse. The checkbox on a group row, a column header or the All column summarizes the cells under it: checked, indeterminate or unchecked. Clicking it only changes the role's own cells; inherited and unavailable ones are counted but never touched.",
    file: 'src/components/permissions-matrix/permissions.ts',
    code: `return {
  checked: on === 0 ? false : on === states.length ? true : 'indeterminate',
  enabled: own.length > 0,
  next: !own.every(isOn),
}`,
  },
  {
    title: 'Unsaved changes are a diff against the last save',
    description:
      'The demo keeps the saved grants next to the edited ones. Their difference marks changed cells with a dot, flags role tabs that have edits, and powers Discard and Save. Replace setSaved with your API call.',
    file: 'src/components/permissions-matrix/permissions.ts',
    code: `for (const k of a) if (!b.has(k)) changed.add(\`\${role.id}:\${k}\`)
for (const k of b) if (!a.has(k)) changed.add(\`\${role.id}:\${k}\`)`,
  },
]

export function PermissionsMatrixTablePage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-normal tracking-tight text-balance sm:text-4xl">
            Shadcn Permissions Matrix Table
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground text-balance">
            Roles and access management in one grid: resources down the side,
            actions across the top. Roles inherit from each other, actions that
            don't apply are greyed out, and View stays on while anything that
            depends on it is granted.
          </p>
        </div>

        <InstallCommand name="permissions-matrix-table" />

        <ComponentPreview
          preview={<PermissionsMatrixDemo />}
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
