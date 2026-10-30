<script lang="ts">
  let { name, email }: { name: string; email: string } = $props()

  const initials = $derived(
    name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2),
  )
</script>

<div class="flex items-center gap-3">
  <span
    aria-hidden="true"
    class="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground"
  >
    {initials}
  </span>
  <div class="min-w-0">
    <p class="truncate font-medium">{name}</p>
    <p class="truncate text-xs text-muted-foreground">{email}</p>
  </div>
</div>
