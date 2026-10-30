<script lang="ts">
  import { cn } from '$lib/utils.js'
  import type { SyncStatus } from './data'

  const statusStyle: Record<SyncStatus, { dot: string; label: string }> = {
    synced: { dot: 'bg-emerald-500', label: 'Synced' },
    syncing: { dot: 'bg-sky-500 animate-pulse', label: 'Syncing…' },
    failed: { dot: 'bg-red-500', label: 'Failed' },
  }

  let { status, error }: { status: SyncStatus; error?: string } = $props()
</script>

<div class="flex items-center gap-2">
  <span class={cn('size-1.5 rounded-full', statusStyle[status].dot)}></span>
  <span>{statusStyle[status].label}</span>
  {#if status === 'failed' && error}
    <span class="text-xs text-muted-foreground">· {error}</span>
  {/if}
</div>
