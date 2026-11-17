<script lang="ts">
  import Check from '@lucide/svelte/icons/check'
  import CircleAlert from '@lucide/svelte/icons/circle-alert'
  import Copy from '@lucide/svelte/icons/copy'
  import { Badge } from '$lib/components/ui/badge/index.js'
  import type { RowStatus } from './review'

  let { status, problems }: { status: RowStatus; problems: number } = $props()

  const badges = {
    ready: { label: 'Ready', icon: Check, class: '' },
    invalid: {
      label: 'Needs fixing',
      icon: CircleAlert,
      class: 'border-destructive/40 text-destructive',
    },
    duplicate: {
      label: 'Duplicate',
      icon: Copy,
      class: 'border-amber-500/50 text-amber-700 dark:text-amber-400',
    },
    skipped: { label: 'Skipped', icon: null, class: 'text-muted-foreground' },
  }

  const badge = $derived(badges[status])
</script>

<Badge variant="outline" class={badge.class}>
  {#if badge.icon}<badge.icon class="size-3" />{/if}
  {status === 'invalid' && problems > 1 ? `${problems} problems` : badge.label}
</Badge>
