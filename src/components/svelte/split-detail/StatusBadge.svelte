<script lang="ts">
  import { Badge } from '$lib/components/ui/badge/index.js'
  import type { Status } from './data'
  import { statusStyle } from './styles'

  let { status }: { status: Status } = $props()
</script>

<Badge variant="outline" class={statusStyle[status].className}>
  {statusStyle[status].label}
</Badge>
