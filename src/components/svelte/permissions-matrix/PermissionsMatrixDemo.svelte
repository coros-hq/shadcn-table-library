<script lang="ts">
  import Lock from '@lucide/svelte/icons/lock'
  import { Button } from '$lib/components/ui/button/index.js'
  import { Checkbox } from '$lib/components/ui/checkbox/index.js'
  import { cn } from '$lib/utils.js'
  import { initialGrants, resourceGroups, roles } from './data'
  import type { Grants } from './data'
  import PermissionsTable from './PermissionsTable.svelte'
  import { cellsFor } from './columns'
  import type { Cell } from './permissions'
  import { cellState, changes, getRole, isOn, setCells } from './permissions'

  const allCells = cellsFor(resourceGroups.flatMap((g) => g.resources))

  // Grants hold Sets that are only ever replaced, never mutated, so raw state is enough
  let saved = $state.raw<Grants>(initialGrants)
  let grants = $state.raw<Grants>(initialGrants)
  let roleId = $state('editor')

  const role = $derived(getRole(roleId))
  const changed = $derived(changes(saved, grants))

  const states = $derived(
    allCells
      .map((cell) => cellState(roleId, cell, grants))
      .filter((s) => s.kind !== 'unavailable'),
  )
  const granted = $derived(states.filter(isOn).length)
  const inherited = $derived(
    states.filter((s) => s.kind === 'inherited').length,
  )

  const isDirty = (id: string) =>
    [...changed].some((c) => c.startsWith(`${id}:`))

  function update(cells: Cell[], on: boolean) {
    grants = setCells(grants, roleId, cells, on)
  }

  const roleNote = $derived.by(() => {
    if (role.locked)
      return 'System role. It always has every permission and cannot be edited.'
    if (role.inherits) {
      const parent = getRole(role.inherits).name
      return `Inherits everything ${parent} can do. Change those on the ${parent} tab.`
    }
    return 'A base role. Roles that inherit from it get these permissions too.'
  })
</script>

<div class="space-y-3">
  <div
    role="group"
    aria-label="Role"
    class="flex gap-1 overflow-x-auto rounded-lg bg-muted p-1"
  >
    {#each roles as r (r.id)}
      <button
        type="button"
        aria-pressed={r.id === roleId}
        onclick={() => (roleId = r.id)}
        class="flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-xs"
      >
        {#if r.locked}<Lock class="size-3.5" />{/if}
        {r.name}
        {#if isDirty(r.id)}
          <span aria-hidden="true" class="size-1.5 rounded-full bg-amber-500"
          ></span>
          <span class="sr-only">(unsaved changes)</span>
        {/if}
      </button>
    {/each}
  </div>

  <div class="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
    <div class="space-y-0.5">
      <p class="text-sm">
        <span class="font-medium">{role.name}</span>
        <span class="text-muted-foreground">{role.description}</span>
      </p>
      <p class="text-xs text-muted-foreground">{roleNote}</p>
    </div>
    <ul
      aria-label="Legend"
      class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground"
    >
      <li class="flex items-center gap-1.5">
        <Checkbox
          checked
          tabindex={-1}
          aria-hidden="true"
          class="pointer-events-none"
        />
        Granted
      </li>
      <li class="flex items-center gap-1.5">
        <Checkbox
          checked
          tabindex={-1}
          aria-hidden="true"
          class="pointer-events-none data-[state=checked]:border-transparent data-[state=checked]:bg-muted-foreground/25 data-[state=checked]:text-foreground"
        />
        Inherited
      </li>
      <li class="flex items-center gap-1.5">
        <Checkbox
          checked
          tabindex={-1}
          aria-hidden="true"
          class="pointer-events-none opacity-50"
        />
        Required by another action
      </li>
      <li class="flex items-center gap-1.5">
        <span aria-hidden="true" class="w-4 text-center text-muted-foreground/50"
          >–</span
        >
        Not available
      </li>
    </ul>
  </div>

  <PermissionsTable {roleId} {grants} {changed} setCells={update} />

  <div class="flex flex-wrap items-center justify-between gap-3">
    <p class="text-sm text-muted-foreground tabular-nums">
      {granted} of {states.length} permissions{inherited
        ? `, ${inherited} inherited`
        : ''}
    </p>
    <div class="flex items-center gap-2">
      <span
        aria-live="polite"
        class={cn(
          'text-sm whitespace-nowrap tabular-nums',
          changed.size ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        {changed.size
          ? `${changed.size} unsaved change${changed.size === 1 ? '' : 's'}`
          : 'All changes saved'}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={!changed.size}
        onclick={() => (grants = saved)}
      >
        Discard
      </Button>
      <Button size="sm" disabled={!changed.size} onclick={() => (saved = grants)}>
        Save changes
      </Button>
    </div>
  </div>
</div>
