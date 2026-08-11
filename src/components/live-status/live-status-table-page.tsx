import { ComponentPreview } from '#/components/docs/component-preview.tsx'
import { DocsLayout } from '#/components/docs/docs-layout.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import columnsSource from './columns.tsx?raw'
import statusIndicatorSource from './status-indicator.tsx?raw'
import tableSource from './data-table.tsx?raw'
import demoSource from './index.tsx?raw'
import { LiveStatusTableDemo } from './index'

const files = [
  { path: 'src/components/live-status/columns.tsx', code: columnsSource },
  {
    path: 'src/components/live-status/status-indicator.tsx',
    code: statusIndicatorSource,
  },
  { path: 'src/components/live-status/data-table.tsx', code: tableSource },
  { path: 'src/components/live-status/index.tsx', code: demoSource },
]

const steps = [
  {
    title: 'One cell mutates per tick, not the whole table',
    description:
      "The interval advances a ref-backed cursor and only maps over the row at that index, leaving every other row's object reference untouched. That means TanStack Table only re-renders the one row that actually changed instead of the whole body repainting every 1.8s.",
    file: 'src/components/live-status/data-table.tsx',
    code: `const index = cursor.current % prev.length
cursor.current += 1
return prev.map((service, i) => {
  if (i !== index) return service
  const status = nextStatus(service.status)
  return { ...service, status, latencyMs: jitterLatency(service.latencyMs, status) }
})`,
  },
  {
    title: 'Status transitions are weighted, not random',
    description:
      "nextStatus() picks from a small array of possible next states per current status, where the array itself encodes the odds — operational lists itself three times and degraded once, so a healthy service mostly stays healthy and rarely dips. A uniform 3-way random pick would make every service flicker between states constantly, which reads as broken rather than live.",
    file: 'src/components/live-status/data-table.tsx',
    code: `const TRANSITIONS: Record<ServiceStatus, ServiceStatus[]> = {
  operational: ['operational', 'operational', 'operational', 'degraded'],
  degraded: ['operational', 'operational', 'degraded', 'down'],
  down: ['degraded', 'down', 'down'],
}`,
  },
  {
    title: 'The pulse ring is absent for "down", not just recolored',
    description:
      "StatusIndicator only renders the animate-ping ring when config.pulse is true, which is false for \"down\". A dead service shouldn't pull the eye the way a live, changing one should — the animation itself is the signal that something is actively being monitored, so it has to stop when there's nothing left to watch.",
    file: 'src/components/live-status/status-indicator.tsx',
    code: `const STATUS_CONFIG: Record<ServiceStatus, { label: string; dot: string; pulse: boolean }> = {
  operational: { label: 'Operational', dot: 'bg-emerald-500', pulse: true },
  degraded: { label: 'Degraded', dot: 'bg-amber-500', pulse: true },
  down: { label: 'Down', dot: 'bg-red-500', pulse: false },
}`,
  },
  {
    title: 'The Live/Paused toggle just flips the effect\'s dependency',
    description:
      "isLive is a plain useState read by the interval effect's dependency array. Toggling it to false lets the effect's cleanup clear the interval on the next render, and toggling back true re-arms it — no separate start/stop functions or manual clearInterval bookkeeping outside the effect.",
    file: 'src/components/live-status/data-table.tsx',
    code: `useEffect(() => {
  if (!isLive) return
  const interval = window.setInterval(() => { /* mutate one row */ }, 1800)
  return () => window.clearInterval(interval)
}, [isLive, onDataChange])`,
  },
]

export function LiveStatusTablePage() {
  return (
    <DocsLayout>
      <section className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Live Status Indicators
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A service-health table where status and latency update on their
            own on a timer — a pulsing dot for actively-monitored states, a
            still one once a service goes down. Toggle Live/Paused to see the
            updates stop.
          </p>
        </div>

        <InstallCommand name="live-status-table" />

        <ComponentPreview preview={<LiveStatusTableDemo />} files={files} />

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
