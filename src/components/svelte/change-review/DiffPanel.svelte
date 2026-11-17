<script lang="ts">
  import Check from '@lucide/svelte/icons/check'
  import ChevronDown from '@lucide/svelte/icons/chevron-down'
  import ChevronUp from '@lucide/svelte/icons/chevron-up'
  import X from '@lucide/svelte/icons/x'
  import { Badge } from '$lib/components/ui/badge/index.js'
  import { Button } from '$lib/components/ui/button/index.js'
  import { Checkbox } from '$lib/components/ui/checkbox/index.js'
  import { cn } from '$lib/utils.js'
  import type { Change } from './data'
  import { diffLines, fieldLabel, keysOf, rowState } from './diff'
  import type { Decision, Decisions, DiffLine } from './diff'

  type Props = {
    /** The change being reviewed; the panel is closed while this is null */
    change: Change | null
    /** "3 of 11", for the change being reviewed */
    position: { index: number; total: number }
    decisions: Decisions
    /** `advance` moves on to the next change to review */
    ondecide: (
      keys: string[],
      decision: Decision | null,
      advance?: boolean,
    ) => void
    onprevious: () => void
    onnext: () => void
    onclose: () => void
  }

  let {
    change,
    position,
    decisions,
    ondecide,
    onprevious,
    onnext,
    onclose,
  }: Props = $props()

  // Keeps the last change on screen while the panel slides out
  let shown = $state<Change | null>(null)
  $effect.pre(() => {
    if (change) shown = change
  })

  // Moving focus to the heading tells screen readers which product is open.
  // On close, focus goes back to that product's row in the table.
  let heading = $state<HTMLHeadingElement | null>(null)
  let lastId: string | undefined
  $effect(() => {
    const id = change?.id
    if (id) heading?.focus()
    else if (lastId) {
      document
        .querySelector<HTMLElement>(`[data-review-id="${lastId}"]`)
        ?.focus()
    }
    lastId = id
  })

  const product = $derived(
    shown?.kind === 'create' ? shown.after : shown?.before,
  )
  const lines = $derived(shown ? diffLines(shown) : [])
  const keys = $derived(shown ? keysOf(shown) : [])
  const state = $derived(shown ? rowState(shown, decisions) : 'pending')
  const pending = $derived(keys.filter((k) => !(k in decisions)))
  // Several changes can be picked one by one; a single one is just the buttons
  const pickable = $derived(shown?.kind === 'update' && keys.length > 1)
  const added = $derived(lines.filter((l) => l.kind === 'added').length)
  const removed = $derived(lines.filter((l) => l.kind === 'removed').length)
  const whole = $derived(
    shown && shown.kind !== 'update' ? decisions[keys[0]] : undefined,
  )

  // Partly decided: the buttons finish the rest instead of overwriting picks
  const targets = $derived(state === 'partial' ? pending : keys)
  const verb = $derived(
    shown?.kind === 'create'
      ? { accept: 'Add product', reject: 'Don’t add' }
      : shown?.kind === 'delete'
        ? { accept: 'Remove product', reject: 'Keep product' }
        : state === 'partial'
          ? { accept: 'Accept the rest', reject: 'Reject the rest' }
          : { accept: 'Accept changes', reject: 'Reject changes' },
  )
  const acceptedCount = $derived(
    keys.filter((k) => decisions[k] === 'accepted').length,
  )

  // The side that won't be used fades once decided
  function dropped(line: DiffLine) {
    const d =
      line.kind === 'context'
        ? undefined
        : line.key
          ? decisions[line.key]
          : whole
    return (
      (line.kind === 'removed' && d === 'accepted') ||
      (line.kind === 'added' && d === 'rejected')
    )
  }
</script>

<!-- A card that opens at the right of the table's frame and pushes the
     table aside, so the highlighted row stays in view next to its diff -->
<section
  aria-label="Review changes"
  aria-hidden={change === null}
  inert={change === null}
  onkeydown={(e) => {
    if (e.key === 'Escape') onclose()
  }}
  class={cn(
    'shrink-0 overflow-hidden bg-background duration-300 ease-out motion-reduce:transition-none max-sm:absolute max-sm:inset-y-0 max-sm:right-0 max-sm:z-20',
    // Pushes the table aside as it widens (on phones it covers it instead).
    // Visible at once when opening, so the heading can take focus; hidden
    // only after closing, so it can't be tabbed to while closed
    change
      ? 'visible w-full border-l transition-[width] sm:w-[26rem]'
      : 'invisible w-0 transition-[width,visibility]',
  )}
>
  <!-- A fixed width inside, so the content doesn't reflow while the panel widens -->
  <div class="flex h-full w-full flex-col sm:w-[26rem]">
    {#if shown && product}
      <header class="relative flex flex-col gap-1 border-b p-4 pr-12">
        <Button
          variant="ghost"
          size="icon"
          class="absolute top-3 right-3 size-7"
          aria-label="Close"
          onclick={onclose}
        >
          <X />
        </Button>
        <div class="flex items-center gap-2">
          <h3
            bind:this={heading}
            tabindex="-1"
            class="font-semibold text-foreground outline-none"
          >
            {product.name}
          </h3>
          {#if shown.kind === 'create'}
            <Badge
              variant="outline"
              class="border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
            >
              New
            </Badge>
          {:else if shown.kind === 'delete'}
            <Badge
              variant="outline"
              class="border-red-500/40 text-red-700 dark:text-red-400"
            >
              Removed
            </Badge>
          {/if}
        </div>
        <div class="flex items-center justify-between gap-2">
          <p class="font-mono text-xs text-muted-foreground">
            {product.sku}
          </p>
          <div class="flex items-center gap-1 text-xs text-muted-foreground">
            <span class="tabular-nums">
              {position.index + 1} of {position.total}
            </span>
            <Button
              variant="ghost"
              size="icon"
              class="size-7"
              aria-label="Previous product with changes"
              onclick={onprevious}
            >
              <ChevronUp />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              class="size-7"
              aria-label="Next product with changes"
              onclick={onnext}
            >
              <ChevronDown />
            </Button>
          </div>
        </div>
      </header>

      <div class="flex-1 overflow-y-auto p-4">
        <div class="overflow-hidden rounded-md border font-mono text-xs">
          <div
            class="flex items-center justify-between border-b bg-muted/50 px-3 py-2 text-muted-foreground"
          >
            <span>products/{product.sku}</span>
            <span>
              {#if added}
                <span class="text-emerald-700 dark:text-emerald-400"
                  >+{added}</span
                >
              {/if}
              {#if removed}
                <span class="text-red-700 dark:text-red-400">−{removed}</span>
              {/if}
            </span>
          </div>
          <table class="w-full border-collapse">
            <tbody>
              {#each lines as line, i (i)}
                <tr
                  class={cn(
                    line.kind === 'added' &&
                      'bg-emerald-500/10 text-emerald-900 dark:text-emerald-200',
                    line.kind === 'removed' &&
                      'bg-red-500/10 text-red-900 dark:text-red-200',
                    line.kind === 'context' && 'text-muted-foreground',
                    dropped(line) && 'opacity-40',
                  )}
                >
                  {#if pickable}
                    <td class="w-8 pl-3 align-middle">
                      {#if line.kind === 'added' && line.key}
                        {@const key = line.key}
                        <Checkbox
                          class="bg-background"
                          checked={decisions[key] === 'accepted'}
                          onCheckedChange={(on) =>
                            ondecide([key], on === true ? 'accepted' : 'rejected')}
                          aria-label="Accept new {fieldLabel[
                            line.field
                          ].toLowerCase()}: {line.value}"
                        />
                      {/if}
                    </td>
                  {/if}
                  <td aria-hidden="true" class="w-6 py-1.5 pl-3 text-center select-none">
                    {line.kind === 'added' ? '+' : line.kind === 'removed' ? '−' : ' '}
                  </td>
                  <td class="w-24 py-1.5 pr-2">{fieldLabel[line.field]}</td>
                  <td class={cn('py-1.5 pr-3 break-words', dropped(line) && 'line-through')}>
                    <span class="sr-only">
                      {line.kind === 'added'
                        ? 'New: '
                        : line.kind === 'removed'
                          ? 'Old: '
                          : 'Unchanged: '}
                    </span>
                    {line.value}
                    {#if line.kind === 'added' && line.moved}
                      <span class="ml-2 opacity-70">{line.moved}</span>
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
        {#if pickable && state !== 'accepted' && state !== 'rejected'}
          <p class="mt-3 text-xs text-muted-foreground">
            Tick the changes to keep, or decide them all at once below.
          </p>
        {/if}
      </div>

      <footer class="flex items-center justify-end gap-2 border-t p-4">
        {#if state === 'pending' || state === 'partial'}
          <!-- On phones the two share the row instead of wrapping -->
          <Button
            variant="outline"
            class="flex-1 sm:flex-none"
            onclick={() => ondecide(targets, 'rejected', true)}
          >
            <X />
            {verb.reject}
          </Button>
          <Button
            class="flex-1 sm:flex-none"
            onclick={() => ondecide(targets, 'accepted', true)}
          >
            <Check />
            {verb.accept}
          </Button>
        {:else}
          <span
            class={cn(
              'mr-auto text-sm',
              state === 'accepted'
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-muted-foreground',
            )}
          >
            {state === 'accepted'
              ? 'Accepted'
              : state === 'rejected'
                ? 'Rejected'
                : `${acceptedCount} of ${keys.length} accepted`}
          </span>
          <Button variant="ghost" onclick={() => ondecide(keys, null)}>
            Undo
          </Button>
          <Button variant="outline" onclick={onnext}>
            Next <ChevronDown />
          </Button>
        {/if}
      </footer>
    {/if}
  </div>
</section>
