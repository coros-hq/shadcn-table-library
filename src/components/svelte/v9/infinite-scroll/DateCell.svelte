<script lang="ts">
  let { createdAt }: { createdAt: string | number | Date } = $props()

  const date = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  })
</script>

<span class="text-muted-foreground">{date.format(new Date(createdAt))}</span>
