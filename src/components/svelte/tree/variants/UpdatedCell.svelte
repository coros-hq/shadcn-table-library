<script lang="ts">
  const date = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })

  let { updatedAt }: { updatedAt: string | number | Date } = $props()
</script>

<span class="whitespace-nowrap text-muted-foreground">{date.format(new Date(updatedAt))}</span>
