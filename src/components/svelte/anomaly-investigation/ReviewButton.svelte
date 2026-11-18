<script lang="ts">
  import Check from '@lucide/svelte/icons/check'
  import { Button } from '$lib/components/ui/button/index.js'
  import { cn } from '$lib/utils.js'

  let {
    name,
    done,
    ontoggle,
  }: { name: string; done: boolean; ontoggle: () => void } = $props()
</script>

<div class="flex justify-end">
  <Button
    variant={done ? 'ghost' : 'outline'}
    size="sm"
    aria-pressed={done}
    aria-label={done
      ? `${name} reviewed. Mark as not reviewed`
      : `Mark ${name} reviewed`}
    onclick={ontoggle}
    class={cn(done && 'text-muted-foreground')}
  >
    <!-- Icon only on phones, where the table has little room -->
    <Check class={cn(!done && 'sm:hidden')} />
    <span class="hidden sm:inline">{done ? 'Reviewed' : 'Mark reviewed'}</span>
  </Button>
</div>
