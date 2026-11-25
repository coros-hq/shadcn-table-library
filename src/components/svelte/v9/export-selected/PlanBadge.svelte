<script lang="ts">
  import { Badge } from '$lib/components/ui/badge/index.js'

  let { plan }: { plan: string } = $props()
</script>

<Badge variant={plan === 'Enterprise' ? 'default' : 'secondary'}>{plan}</Badge>
