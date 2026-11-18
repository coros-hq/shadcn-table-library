<script lang="ts">
  import { cn } from '$lib/utils.js'
  import type { Priority } from './data'
  import { priorityStyle } from './styles'

  let { priority }: { priority: Priority } = $props()
</script>

<span class="flex items-center gap-1.5 whitespace-nowrap">
  <span
    aria-hidden="true"
    class={cn('size-2 rounded-full', priorityStyle[priority].dot)}
  ></span>
  {priorityStyle[priority].label}
</span>
