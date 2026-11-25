<script lang="ts">
  import ArchiveIcon from '$lib/components/ui/icons/ArchiveIcon.svelte'
  import BellRingingIcon from '$lib/components/ui/icons/BellRingingIcon.svelte'
  import StarIcon from '$lib/components/ui/icons/StarIcon.svelte'
  import TrashIcon from '$lib/components/ui/icons/TrashIcon.svelte'
  import { cn } from '$lib/utils.js'
  import type { TeamMember } from './columns'

  type Props = {
    member: TeamMember
    ontoggle: (key: 'favorite' | 'notify' | 'archived') => void
    onremove: () => void
  }

  let { member, ontoggle, onremove }: Props = $props()

  const iconButton =
    'rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground'
</script>

<div class="flex items-center justify-end gap-1">
  <button
    type="button"
    aria-label={member.favorite ? 'Unfavorite' : 'Favorite'}
    aria-pressed={member.favorite}
    title={member.favorite ? 'Unfavorite' : 'Favorite'}
    onclick={() => ontoggle('favorite')}
    class={cn(iconButton, member.favorite && 'text-amber-500 hover:text-amber-500')}
  >
    <StarIcon size={18} filled={member.favorite} />
  </button>
  <button
    type="button"
    aria-label={member.notify ? 'Mute notifications' : 'Notify'}
    aria-pressed={member.notify}
    title={member.notify ? 'Mute notifications' : 'Notify'}
    onclick={() => ontoggle('notify')}
    class={cn(iconButton, member.notify && 'text-blue-500 hover:text-blue-500')}
  >
    <BellRingingIcon size={18} />
  </button>
  <button
    type="button"
    aria-label={member.archived ? 'Unarchive' : 'Archive'}
    aria-pressed={member.archived}
    title={member.archived ? 'Unarchive' : 'Archive'}
    onclick={() => ontoggle('archived')}
    class={cn(iconButton, member.archived && 'text-foreground')}
  >
    <ArchiveIcon size={18} />
  </button>
  <button
    type="button"
    aria-label="Delete"
    title="Delete"
    onclick={onremove}
    class="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
  >
    <TrashIcon size={18} />
  </button>
</div>
