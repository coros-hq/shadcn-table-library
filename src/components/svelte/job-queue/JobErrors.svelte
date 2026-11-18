<script lang="ts">
  import CircleAlert from '@lucide/svelte/icons/circle-alert'
  import CircleCheck from '@lucide/svelte/icons/circle-check'
  import LoaderCircle from '@lucide/svelte/icons/loader-circle'
  import type { Attempt, Job } from './data'
  import { formatDuration, isActive } from './queue'

  /**
   * The expanded row: every attempt, newest first. Failed attempts show their
   * error code, message and stack trace, so a retry can be judged on what
   * actually went wrong.
   */
  let { job }: { job: Job } = $props()

  const attempts = $derived([...job.attempts].reverse())

  const running = (a: Attempt) => !a.endedAt && isActive(job.status)

  function summary(a: Attempt) {
    if (running(a)) return 'running now'
    const took =
      a.endedAt !== undefined ? formatDuration(a.endedAt - a.startedAt) : ''
    if (a.error) {
      return `failed after ${took} at ${a.processed?.toLocaleString('en-US')} of ${job.total.toLocaleString('en-US')} items`
    }
    return a.canceled ? `canceled after ${took}` : `succeeded in ${took}`
  }

  const trace = (lines: string[]) =>
    lines.map((line, i) => (i === 0 ? line : `    ${line}`)).join('\n')
</script>

<ol class="space-y-3">
  {#each attempts as a (a.number)}
    <li class="space-y-1.5">
      <p class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        {#if a.error}
          <CircleAlert class="size-4 text-destructive" />
        {:else if running(a)}
          <LoaderCircle class="size-4 text-blue-600 motion-safe:animate-spin" />
        {:else}
          <CircleCheck class="size-4 text-muted-foreground" />
        {/if}
        <span class="font-medium">Attempt {a.number}</span>
        <span class="text-muted-foreground">{summary(a)}</span>
      </p>
      {#if a.error}
        <div class="ml-6 overflow-hidden rounded-md border border-destructive/20">
          <p class="flex flex-wrap gap-x-2 bg-destructive/5 px-3 py-2 text-sm">
            <code class="font-mono text-xs font-medium text-destructive">
              {a.error.code}
            </code>
            <span>{a.error.message}</span>
          </p>
          <pre
            class="overflow-x-auto px-3 py-2 font-mono text-xs leading-relaxed text-muted-foreground">{trace(
              a.error.trace,
            )}</pre>
        </div>
      {/if}
    </li>
  {/each}
</ol>
