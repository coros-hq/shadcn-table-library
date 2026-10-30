<script lang="ts">
  import { cn } from '$lib/utils.js'
  import { formatDuration } from './data'
  import type { LogEntry } from './data'

  /** Every field of an event, including ones that are not table columns */
  type Props = {
    log: LogEntry
    /** Labels to leave out, when the surrounding layout already shows them */
    omit?: string[]
    class?: string
  }

  let { log, omit = [], class: className }: Props = $props()

  const fields = $derived.by<[string, string][]>(() => {
    const all: [string, string][] = [
      ['Timestamp', new Date(log.timestamp).toISOString()],
      ['Request ID', log.requestId],
      ['Level', log.level],
      ['Service', log.service],
      ['Region', log.region],
      ['Method', log.method],
      ['Path', log.path],
      ['Status', String(log.status)],
      ['Duration', formatDuration(log.durationMs)],
      ['Message', log.message],
    ]
    return all.filter(([label]) => !omit.includes(label))
  })
</script>

<dl
  class={cn(
    'grid grid-cols-[max-content_1fr] gap-x-6 gap-y-1.5 text-sm whitespace-normal',
    className,
  )}
>
  {#each fields as [label, value] (label)}
    <dt class="text-muted-foreground">{label}</dt>
    <dd class="break-all">{value}</dd>
  {/each}
</dl>
