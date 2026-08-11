import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import columnsSource from './columns.tsx?raw'
import tableSource from './data-table.tsx?raw'
import demoSource from './index.tsx?raw'
import iconLibSource from '#/lib/animated-icon.ts?raw'
import starIconSource from '#/components/ui/icons/star-icon.tsx?raw'
import bellIconSource from '#/components/ui/icons/bell-ringing-icon.tsx?raw'
import archiveIconSource from '#/components/ui/icons/archive-icon.tsx?raw'
import trashIconSource from '#/components/ui/icons/trash-icon.tsx?raw'
import refreshIconSource from '#/components/ui/icons/arrows-clockwise-icon.tsx?raw'
import { AnimatedIconsTableDemo } from './index'

const files = [
  { path: 'src/components/animated-icons/columns.tsx', code: columnsSource },
  { path: 'src/components/animated-icons/data-table.tsx', code: tableSource },
  { path: 'src/components/animated-icons/index.tsx', code: demoSource },
  { path: 'src/lib/animated-icon.ts', code: iconLibSource },
  { path: 'src/components/ui/icons/star-icon.tsx', code: starIconSource },
  { path: 'src/components/ui/icons/bell-ringing-icon.tsx', code: bellIconSource },
  { path: 'src/components/ui/icons/archive-icon.tsx', code: archiveIconSource },
  { path: 'src/components/ui/icons/trash-icon.tsx', code: trashIconSource },
  { path: 'src/components/ui/icons/arrows-clockwise-icon.tsx', code: refreshIconSource },
]

const steps = [
  {
    title: 'Every icon exposes an imperative handle, not just `:hover`',
    description:
      "Each icon forwards a ref shaped like { startAnimation, stopAnimation }, because `:hover` never fires on touch. The Reset button in the toolbar calls startAnimation() directly on click, so the refresh spin plays even for someone who tapped the button without ever hovering it.",
    file: 'src/components/animated-icons/data-table.tsx',
    code: `const refreshRef = useRef<IconHandle>(null)

function handleReset() {
  refreshRef.current?.startAnimation()
  onReset()
}

<ArrowsClockwiseIcon ref={refreshRef} size={16} />`,
  },
  {
    title: 'A single useHover() drives motion, focus, and touch together',
    description:
      "Every hover-driven icon (star, bell, archive, trash) shares one useHover() hook from #/lib/animated-icon.ts. It wires onMouseEnter/onMouseLeave AND onFocus/onBlur to the same controls, so tabbing to a row action previews its motion exactly like hovering it does — no separate keyboard path to maintain.",
    file: 'src/lib/animated-icon.ts',
    code: `return {
  controls,
  reduced,
  ambient,
  start,
  stop,
  bind: { onMouseEnter: start, onMouseLeave: stop, onFocus: start, onBlur: stop },
}`,
  },
  {
    title: 'The animation loops for as long as the pointer stays',
    description:
      "start() doesn't just play the \"animate\" variant once — it replays it end-to-end while the pointer or focus is still on the icon, snapping back to \"normal\" between cycles (invisible, since keyframes end where they start) so the next replay actually restarts instead of resolving instantly.",
    file: 'src/lib/animated-icon.ts',
    code: `void controls.start('animate').then(() => {
  if (!looping.current) return
  controls.set('normal')
  if (!ambient) { looping.current = false; return }
  const elapsed = performance.now() - t0
  replayTimer.current = window.setTimeout(run, elapsed < 100 ? 300 : elapsed * 0.3)
})`,
  },
  {
    title: 'Row state drives which icon variant renders, not a second icon set',
    description:
      "There's no separate \"filled star\" icon component. The same StarIcon just gets fill: 'currentColor' when member.favorite is true, and its wrapper button picks up an amber text color. Toggling favorite/notify/archived is a plain array map — the same pattern the Editable Table uses for its optimistic updates.",
    file: 'src/components/animated-icons/data-table.tsx',
    code: `function toggle(id: string, key: 'favorite' | 'notify' | 'archived') {
  onDataChange((prev) =>
    prev.map((row) => (row.id === id ? { ...row, [key]: !row[key] } : row)),
  )
}

<StarIcon size={18} style={{ fill: member.favorite ? 'currentColor' : 'none' }} />`,
  },
]

const iconInstalls = [
  { label: 'Star', slug: 'star' },
  { label: 'Bell Ringing', slug: 'bell-ringing' },
  { label: 'Archive', slug: 'archive' },
  { label: 'Trash', slug: 'trash' },
  { label: 'Arrows Clockwise', slug: 'arrows-clockwise' },
]

export function AnimatedIconsTablePage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Animated Icons Table
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Row actions built with{' '}
            <a
              href="https://github.com/smammar100/Iconimate"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Iconimate
            </a>
            's motion-driven icons instead of static glyphs. Hover, focus, or
            tap a row action to preview its animation; click to apply it.
          </p>
        </div>

        <InstallCommand name="animated-icons-table" />

        <ComponentPreview preview={<AnimatedIconsTableDemo />} files={files} />

        <div className="space-y-2">
          <p className="text-sm font-medium">Installing the icons individually</p>
          <p className="text-sm text-muted-foreground">
            The icons themselves are published on{' '}
            <a
              href="https://iconimate.app"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Iconimate
            </a>
            's own registry, not this one — installing{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              animated-icons-table
            </code>{' '}
            above already pulls all five in, but you can add any of them to
            another project on their own:
          </p>
          <div className="space-y-2">
            {iconInstalls.map((icon) => (
              <div key={icon.slug} className="space-y-1">
                <p className="text-xs text-muted-foreground">{icon.label}</p>
                <InstallCommand
                  name={icon.slug}
                  command={`npx shadcn add https://iconimate.app/r/${icon.slug}.json`}
                />
              </div>
            ))}
          </div>
        </div>

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
