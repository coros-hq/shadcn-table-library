<script lang="ts">
  import { cn } from '$lib/utils.js'
  import { statusTone } from './columns'
  import Highlight from './Highlight.svelte'
  import type { LogEntry } from './data'

  let { log, query }: { log: LogEntry; query: string } = $props()
</script>

<span class="flex items-center gap-2 whitespace-nowrap">
  <span class={cn('font-medium tabular-nums', statusTone(log.status))}>{log.status}</span>
  <span class="text-xs font-medium text-muted-foreground">{log.method}</span>
  <span><Highlight text={log.path} {query} /></span>
</span>
