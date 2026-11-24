<script lang="ts">
  import ArrowsClockwiseIcon from '$lib/components/ui/icons/ArrowsClockwiseIcon.svelte'
  import { cn } from '$lib/utils.js'
  import { actionButtonBase } from './actionButtonStyles'

  type Props = {
    status: 'synced' | 'syncing' | 'failed'
    onsync?: () => void
  }

  let { status, onsync }: Props = $props()

  // The button, not the icon, owns the animation. The icon sits in a
  // pointer-events-none wrapper so its own hover handlers can't stop a spin
  // that a pending request started.
  let icon: ArrowsClockwiseIcon | undefined
  const syncing = $derived(status === 'syncing')

  // The refresh icon spins once per start, so re-trigger it for as long as
  // the request is pending.
  $effect(() => {
    if (!syncing) return
    icon?.startAnimation()
    const id = window.setInterval(() => icon?.startAnimation(), 900)
    return () => {
      window.clearInterval(id)
      icon?.stopAnimation()
    }
  })

  const start = () => icon?.startAnimation()
  const stop = () => {
    if (!syncing) icon?.stopAnimation()
  }
</script>

<button
  type="button"
  disabled={syncing}
  aria-busy={syncing}
  class={cn(actionButtonBase, 'w-24', syncing && 'text-foreground')}
  onclick={() => onsync?.()}
  onmouseenter={start}
  onfocus={start}
  onmouseleave={stop}
  onblur={stop}
>
  <span class="pointer-events-none inline-flex">
    <ArrowsClockwiseIcon bind:this={icon} size={16} />
  </span>
  {syncing ? 'Syncing…' : status === 'failed' ? 'Retry' : 'Sync'}
</button>
