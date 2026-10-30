<script lang="ts">
  import TrashIcon from '$lib/components/ui/icons/TrashIcon.svelte'
  import { cn } from '$lib/utils.js'
  import { actionButtonBase } from './actionButtonStyles'

  type Props = {
    name: string
    confirming: boolean
    disabled?: boolean
    onrequest?: () => void
    onconfirm?: () => void
    oncancel?: () => void
  }

  let { name, confirming, disabled, onrequest, onconfirm, oncancel }: Props = $props()

  let icon: TrashIcon | undefined
  let button: HTMLButtonElement | undefined

  // While waiting for the second click: keep the lid moving, and cancel on
  // Escape or a click anywhere else. Listening on the document works even
  // when the click didn't focus the button (Safari and Firefox on macOS).
  $effect(() => {
    if (!confirming) return
    icon?.startAnimation()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') oncancel?.()
    }
    const onPointerDown = (e: PointerEvent) => {
      if (!button?.contains(e.target as Node)) oncancel?.()
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
      icon?.stopAnimation()
    }
  })

  const stop = () => {
    if (!confirming) icon?.stopAnimation()
  }
</script>

<!-- A fixed slot: the Confirm state grows leftward over the Archive slot
     instead of pushing the other actions around. -->
<div class="relative size-8 shrink-0">
  <button
    bind:this={button}
    type="button"
    aria-label={confirming ? `Confirm delete ${name}` : `Delete ${name}`}
    title={confirming ? 'Click again to delete' : 'Delete'}
    {disabled}
    class={cn(
      actionButtonBase,
      'absolute top-0 right-0 justify-center disabled:opacity-40',
      confirming
        ? 'bg-destructive/10 text-destructive hover:bg-destructive/15 hover:text-destructive'
        : 'w-8 px-0 hover:bg-destructive/10 hover:text-destructive',
    )}
    onclick={() => (confirming ? onconfirm?.() : onrequest?.())}
    onmouseenter={() => icon?.startAnimation()}
    onfocus={() => icon?.startAnimation()}
    onmouseleave={stop}
    onblur={stop}
  >
    <span class="pointer-events-none inline-flex">
      <TrashIcon bind:this={icon} size={16} />
    </span>
    {#if confirming}Confirm{/if}
  </button>
</div>
