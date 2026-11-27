<script lang="ts">
  // One hue per meaning, and the label always carries the status too
  const statusStyle: Record<string, string> = {
    Active: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    Pending: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    Inactive: 'bg-muted text-muted-foreground',
  }

  let { status }: { status: string } = $props()
</script>

<span
  class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium {statusStyle[status] ?? 'bg-muted text-muted-foreground'}"
>
  {status}
</span>
