<script lang="ts">
  import Check from '@lucide/svelte/icons/check'
  import TriangleAlert from '@lucide/svelte/icons/triangle-alert'
  import * as Popover from '$lib/components/ui/popover/index.js'
  import { cn } from '$lib/utils.js'
  import { shiftById } from './data'
  import type { Assignment } from './data'
  import ShiftChip from './ShiftChip.svelte'
  import { options, shiftTone } from './tone'

  type Props = {
    /** Lets the table find this cell to move focus to it */
    cellKey: string
    value: Assignment
    /** Who and which day, for screen readers: "Tom Becker, Wed 25" */
    label: string
    changed: boolean
    /** Hours of rest before this shift when it's too few, otherwise null */
    rest: number | null
    /** Roving tabindex: only the grid's current cell is in the tab order */
    tabbable: boolean
    onassign: (value: Assignment) => void
    onkeydown: (event: KeyboardEvent) => void
  }

  let {
    cellKey,
    value,
    label,
    changed,
    rest,
    tabbable,
    onassign,
    onkeydown,
  }: Props = $props()

  let open = $state(false)
  let list = $state<HTMLElement>()
  const shift = $derived(value ? shiftById[value] : null)

  const description = $derived(
    [
      shift ? `${shift.label}, ${shift.time}` : 'Off',
      rest !== null ? `only ${rest}h rest after the previous shift` : null,
      changed ? 'changed' : null,
    ]
      .filter(Boolean)
      .join('; '),
  )

  // Start on the current choice rather than the first one
  function focusCurrent(event: Event) {
    event.preventDefault()
    list?.querySelector<HTMLElement>('[aria-pressed="true"]')?.focus()
  }

  function moveInList(event: KeyboardEvent) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()
    const items = [...(list?.querySelectorAll<HTMLElement>('button') ?? [])]
    const i = items.indexOf(document.activeElement as HTMLElement)
    const next = event.key === 'ArrowDown' ? i + 1 : i - 1
    items[(next + items.length) % items.length]?.focus()
  }

  function pick(next: Assignment) {
    onassign(next)
    open = false
  }
</script>

<Popover.Root bind:open>
  <Popover.Trigger>
    {#snippet child({ props })}
      <button
        {...props}
        type="button"
        data-cell={cellKey}
        tabindex={tabbable ? 0 : -1}
        aria-label="{label}: {description}"
        title={rest !== null
          ? `Only ${rest}h rest since the previous shift (11h minimum)`
          : undefined}
        {onkeydown}
        class={cn(
          'group/cell relative flex h-11 w-full min-w-14 items-center justify-center rounded-md text-xs font-semibold outline-none',
          'focus-visible:ring-[3px] focus-visible:ring-ring/60',
          shift
            ? shiftTone[shift.id]
            : 'text-muted-foreground/40 hover:bg-muted hover:text-muted-foreground',
          rest !== null && 'ring-2 ring-destructive ring-inset',
        )}
      >
        {#if shift}
          {shift.code}
        {:else}
          <span aria-hidden="true" class="group-hover/cell:hidden">–</span>
          <span aria-hidden="true" class="hidden group-hover/cell:inline">
            +
          </span>
        {/if}
        {#if rest !== null}
          <TriangleAlert
            aria-hidden="true"
            class="absolute top-1 left-1 size-3 text-destructive"
          />
        {/if}
        {#if changed}
          <span
            aria-hidden="true"
            class="absolute top-1 right-1 size-1.5 rounded-full bg-blue-500"
          ></span>
        {/if}
      </button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content
    align="center"
    class="w-56 p-1"
    aria-label="Shift for {label}"
    onOpenAutoFocus={focusCurrent}
    onkeydown={moveInList}
  >
    <div bind:this={list}>
      <p class="px-2 pt-1 pb-1.5 text-xs text-muted-foreground">{label}</p>
      {#each options as option (option.label)}
        <button
          type="button"
          aria-pressed={option.value === value}
          onclick={() => pick(option.value)}
          class="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none hover:bg-accent focus-visible:bg-accent"
        >
          {#if option.value}
            <ShiftChip shift={option.value} />
          {:else}
            <span
              aria-hidden="true"
              class="inline-flex size-5 items-center justify-center rounded border border-dashed text-[11px] text-muted-foreground"
            >
              –
            </span>
          {/if}
          <span class="flex-1">{option.label}</span>
          <span class="text-xs text-muted-foreground tabular-nums">
            {option.time}
          </span>
          <Check
            aria-hidden="true"
            class={cn(
              'size-4',
              option.value === value ? 'opacity-100' : 'opacity-0',
            )}
          />
        </button>
      {/each}
      <p class="mt-1 border-t px-2 pt-1.5 pb-1 text-xs text-muted-foreground">
        Or type E, L, N, A on a cell. Delete clears it.
      </p>
    </div>
  </Popover.Content>
</Popover.Root>
