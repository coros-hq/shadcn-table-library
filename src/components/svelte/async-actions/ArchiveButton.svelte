<script lang="ts">
  import ArchiveIcon from '$lib/components/ui/icons/ArchiveIcon.svelte'
  import { cn } from '$lib/utils.js'
  import { actionButtonBase } from './actionButtonStyles'

  type Props = {
    name: string
    disabled?: boolean
    /** Hidden (but still taking space) while Delete asks for confirmation */
    concealed?: boolean
    onarchive?: () => void
  }

  let { name, disabled, concealed, onarchive }: Props = $props()

  let icon: ArchiveIcon | undefined

  function onClick() {
    icon?.startAnimation()
    onarchive?.()
  }
</script>

<button
  type="button"
  aria-label="Archive {name}"
  title="Archive"
  {disabled}
  aria-hidden={concealed}
  tabindex={concealed ? -1 : undefined}
  class={cn(
    actionButtonBase,
    'w-8 justify-center px-0 disabled:opacity-40',
    concealed && 'invisible',
  )}
  onclick={onClick}
  onmouseenter={() => icon?.startAnimation()}
  onfocus={() => icon?.startAnimation()}
  onmouseleave={() => icon?.stopAnimation()}
  onblur={() => icon?.stopAnimation()}
>
  <span class="pointer-events-none inline-flex">
    <ArchiveIcon bind:this={icon} size={16} />
  </span>
</button>
