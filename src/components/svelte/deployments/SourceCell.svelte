<script lang="ts">
  import GitBranch from '@lucide/svelte/icons/git-branch'
  import GitCommitHorizontal from '@lucide/svelte/icons/git-commit-horizontal'
  import type { Deployment } from './data'

  let { deployment: d }: { deployment: Deployment } = $props()
</script>

<div class="min-w-0 max-w-72 space-y-1">
  <p class="flex items-center gap-1.5 truncate">
    <GitBranch class="size-3.5 shrink-0 text-muted-foreground" />
    <span class="truncate">{d.branch}</span>
  </p>
  <p class="flex items-center gap-1.5 text-xs text-muted-foreground">
    <GitCommitHorizontal class="size-3.5 shrink-0" />
    <span class="font-mono">{d.sha}</span>
    <span class="truncate">{d.message}</span>
  </p>
</div>
