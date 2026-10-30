<script lang="ts">
  import { formatAge } from './data'

  let { createdAt, author }: { createdAt: number; author: string } = $props()
</script>

<div class="flex items-center justify-end gap-2 text-sm text-muted-foreground">
  <span class="tabular-nums">{formatAge(createdAt)}</span>
  <span>by {author}</span>
  <span
    aria-hidden="true"
    class="flex size-6 items-center justify-center rounded-full bg-muted text-[11px] font-medium text-foreground uppercase"
  >
    {author.slice(0, 2)}
  </span>
</div>
