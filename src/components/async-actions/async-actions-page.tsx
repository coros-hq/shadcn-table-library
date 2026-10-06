import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import tableSource from './data-table.tsx?raw'
import buttonsSource from './action-buttons.tsx?raw'
import dataSource from './data.ts?raw'
import demoSource from './index.tsx?raw'
import { AsyncActionsDemo } from './index'
import vueAsyncActionsAsyncActionsDemoSource from '#/components/vue/async-actions/AsyncActionsDemo.vue?raw'
import vueAsyncActionsArchiveButtonSource from '#/components/vue/async-actions/ArchiveButton.vue?raw'
import vueAsyncActionsAsyncActionsTableSource from '#/components/vue/async-actions/AsyncActionsTable.vue?raw'
import vueAsyncActionsDeleteButtonSource from '#/components/vue/async-actions/DeleteButton.vue?raw'
import vueAsyncActionsSyncButtonSource from '#/components/vue/async-actions/SyncButton.vue?raw'
import vueAsyncActionsactionButtonStylesSource from '#/components/vue/async-actions/actionButtonStyles.ts?raw'
import vueAsyncActionsdataSource from '#/components/vue/async-actions/data.ts?raw'
import vueAsyncActionssharediconsArchiveIconSource from '#/components/vue/shared/icons/ArchiveIcon.vue?raw'
import vueAsyncActionssharediconsuseIconAnimationSource from '#/components/vue/shared/icons/useIconAnimation.ts?raw'
import vueAsyncActionssharediconsTrashIconSource from '#/components/vue/shared/icons/TrashIcon.vue?raw'
import vueAsyncActionssharediconsArrowsClockwiseIconSource from '#/components/vue/shared/icons/ArrowsClockwiseIcon.vue?raw'

const files = [
  { path: 'src/components/async-actions/data-table.tsx', code: tableSource },
  {
    path: 'src/components/async-actions/action-buttons.tsx',
    code: buttonsSource,
  },
  { path: 'src/components/async-actions/data.ts', code: dataSource },
  { path: 'src/components/async-actions/index.tsx', code: demoSource },
]

const vueFiles = [
  {
    path: 'src/components/async-actions/AsyncActionsDemo.vue',
    code: vueAsyncActionsAsyncActionsDemoSource,
  },
  {
    path: 'src/components/async-actions/ArchiveButton.vue',
    code: vueAsyncActionsArchiveButtonSource,
  },
  {
    path: 'src/components/async-actions/AsyncActionsTable.vue',
    code: vueAsyncActionsAsyncActionsTableSource,
  },
  {
    path: 'src/components/async-actions/DeleteButton.vue',
    code: vueAsyncActionsDeleteButtonSource,
  },
  {
    path: 'src/components/async-actions/SyncButton.vue',
    code: vueAsyncActionsSyncButtonSource,
  },
  {
    path: 'src/components/async-actions/actionButtonStyles.ts',
    code: vueAsyncActionsactionButtonStylesSource,
  },
  {
    path: 'src/components/async-actions/data.ts',
    code: vueAsyncActionsdataSource,
  },
  {
    path: 'src/components/ui/icons/ArchiveIcon.vue',
    code: vueAsyncActionssharediconsArchiveIconSource,
  },
  {
    path: 'src/components/ui/icons/useIconAnimation.ts',
    code: vueAsyncActionssharediconsuseIconAnimationSource,
  },
  {
    path: 'src/components/ui/icons/TrashIcon.vue',
    code: vueAsyncActionssharediconsTrashIconSource,
  },
  {
    path: 'src/components/ui/icons/ArrowsClockwiseIcon.vue',
    code: vueAsyncActionssharediconsArrowsClockwiseIconSource,
  },
]

const vueDeps = {
  npm: [],
  shadcn: ['button', 'table'],
}

const steps = [
  {
    title: 'The button owns the animation, not the icon',
    description:
      "Each animated icon plays on its own hover, which would stop a spin the moment the pointer leaves mid-request. So the icon gets pointer-events-none and the button drives it through the icon's imperative handle: hover and focus start it, and leaving only stops it when nothing is pending.",
    file: 'src/components/async-actions/action-buttons.tsx',
    code: `function hoverHandlers(ref, locked = false) {
  const start = () => ref.current?.startAnimation()
  const stop = () => {
    if (!locked) ref.current?.stopAnimation()
  }
  return { onMouseEnter: start, onFocus: start, onMouseLeave: stop, onBlur: stop }
}`,
  },
  {
    title: 'A pending request keeps the icon spinning',
    description:
      'The refresh icon spins once per start, so while a row is syncing an effect re-triggers it every 900 ms and stops it when the status changes. The row status, not a separate loading flag, is what drives the motion.',
    file: 'src/components/async-actions/action-buttons.tsx',
    code: `useEffect(() => {
  if (!syncing) return
  icon.current?.startAnimation()
  const id = window.setInterval(() => icon.current?.startAnimation(), 900)
  return () => {
    window.clearInterval(id)
    icon.current?.stopAnimation()
  }
}, [syncing])`,
  },
  {
    title: 'Reversible actions get Undo, destructive ones get a confirm',
    description:
      'Archive removes the row right away and offers Undo for 6 seconds, putting the row back where it was. Delete cannot be undone, so the first click turns the button into "Confirm" for 3 seconds; Escape or clicking away cancels it.',
    file: 'src/components/async-actions/data-table.tsx',
    code: `function requestDelete(id: string) {
  setConfirmingId(id)
  window.clearTimeout(confirmTimer.current)
  confirmTimer.current = later(() => setConfirmingId(null), CONFIRM_MS)
}`,
  },
  {
    title: 'Rows fade out before they are removed',
    description:
      "Removing a row instantly would cut off the archive or trash animation. The row is first marked as leaving, fades to transparent, and is removed after 450 ms, so the icon's motion is the last thing the user sees.",
    file: 'src/components/async-actions/data-table.tsx',
    code: `setLeaving((prev) => new Set(prev).add(id))
later(() => {
  setSources((prev) => prev.filter((s) => s.id !== id))
}, EXIT_MS)`,
  },
]

export function AsyncActionsPage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-normal tracking-tight sm:text-4xl">
            Shadcn Async Row Actions
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground text-balance">
            Row actions that show what is actually happening: the sync icon
            spins while a request is pending, failures turn into Retry, archive
            offers Undo, and delete asks for a second click. The animated icons
            act as feedback, not decoration.
          </p>
        </div>

        <InstallCommand name="async-actions-table" />

        <ComponentPreview
          preview={<AsyncActionsDemo />}
          files={files}
          vueFiles={vueFiles}
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
