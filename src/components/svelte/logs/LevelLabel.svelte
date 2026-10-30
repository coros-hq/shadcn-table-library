<script lang="ts">
  import { cn } from '$lib/utils.js'
  import type { LogLevel } from './data'
  import LevelDot from './LevelDot.svelte'
  import { levelStyles } from './level-styles'

  let { level }: { level: LogLevel } = $props()
</script>

<span class={cn('flex items-center gap-2 font-medium capitalize', levelStyles[level].text)}>
  <LevelDot {level} />
  {level}
</span>
