<script lang="ts">
  import RotateCw from '@lucide/svelte/icons/rotate-cw'
  import TriangleAlert from '@lucide/svelte/icons/triangle-alert'
  import { cn } from '$lib/utils.js'
  import { Button } from '$lib/components/ui/button/index.js'

  type Props = {
    title: string
    description: string
    canRetry?: boolean
    isRetrying?: boolean
    /** `panel` fills an empty table body; `banner` sits above stale rows */
    variant?: 'panel' | 'banner'
    onretry?: () => void
  }

  let {
    title,
    description,
    canRetry = true,
    isRetrying = false,
    variant = 'panel',
    onretry,
  }: Props = $props()
</script>

{#snippet retryButton()}
  {#if canRetry}
    <Button
      variant="outline"
      size="sm"
      disabled={isRetrying}
      onclick={() => onretry?.()}
    >
      <RotateCw class={cn(isRetrying && 'animate-spin')} />
      {isRetrying ? 'Retrying...' : 'Try again'}
    </Button>
  {/if}
{/snippet}

{#if variant === 'banner'}
  <div
    role="alert"
    class="flex flex-wrap items-center gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3"
  >
    <TriangleAlert class="size-4 shrink-0 text-destructive" />
    <div class="min-w-0 flex-1 text-sm">
      <p class="font-medium">{title}</p>
      <p class="text-muted-foreground">{description}</p>
    </div>
    {@render retryButton()}
  </div>
{:else}
  <div
    role="alert"
    class="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center"
  >
    <div
      class="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive"
    >
      <TriangleAlert class="size-5" />
    </div>
    <div class="space-y-1">
      <p class="text-sm font-medium">{title}</p>
      <p class="max-w-sm text-sm text-balance text-muted-foreground">
        {description}
      </p>
    </div>
    {@render retryButton()}
  </div>
{/if}
