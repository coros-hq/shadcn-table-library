<script lang="ts">
  import { cn } from '$lib/utils.js'

  type Props = {
    primary: string
    secondary: string
    primaryClass?: string
    secondaryClass?: string
  }

  let { primary, secondary, primaryClass, secondaryClass }: Props = $props()
</script>

<div class="tabular-nums">
  <p class={primaryClass}>{primary}</p>
  <p class={cn('text-xs text-muted-foreground', secondaryClass)}>{secondary}</p>
</div>
