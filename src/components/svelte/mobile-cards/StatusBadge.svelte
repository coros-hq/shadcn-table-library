<script lang="ts">
  import { Badge } from '$lib/components/ui/badge/index.js'

  let {
    status,
    variant,
  }: { status: string; variant: 'default' | 'secondary' | 'outline' } = $props()
</script>

<Badge {variant}>{status}</Badge>
