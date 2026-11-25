<script lang="ts">
  import { Badge } from '$lib/components/ui/badge/index.js'
  import { cn } from '$lib/utils.js'

  let { status, className }: { status: string; className?: string } = $props()
</script>

<Badge variant="outline" class={cn('border-transparent', className)}>
  {status}
</Badge>
