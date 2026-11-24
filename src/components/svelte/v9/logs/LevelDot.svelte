<script lang="ts">
  import { cn } from '$lib/utils.js'
  import type { LogLevel } from './data'
  import { levelStyles } from './level-styles'

  /** Level marker, shared by the table and the Level filter menu */
  let { level }: { level: LogLevel } = $props()
</script>

<span aria-hidden="true" class={cn('size-1.5 shrink-0 rounded-full', levelStyles[level].dot)}></span>
