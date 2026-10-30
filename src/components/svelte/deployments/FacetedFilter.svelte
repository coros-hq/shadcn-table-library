<script lang="ts" generics="TData">
  import type { Snippet } from 'svelte'
  import type { Column } from '@tanstack/table-core'
  import Check from '@lucide/svelte/icons/check'
  import PlusCircle from '@lucide/svelte/icons/circle-plus'
  import { Badge } from '$lib/components/ui/badge/index.js'
  import { Button } from '$lib/components/ui/button/index.js'
  import * as Command from '$lib/components/ui/command/index.js'
  import * as Popover from '$lib/components/ui/popover/index.js'
  import { cn } from '$lib/utils.js'

  /**
   * Multi-select column filter. Counts come from TanStack's faceting, which
   * applies every *other* active filter, so they always add up to what you'd
   * see after ticking that option.
   */
  type Props = {
    column: Column<TData> | undefined
    title: string
    options: readonly string[]
    /** Optional marker drawn before each option, e.g. a status dot */
    icon?: Snippet<[string]>
  }

  let { column, title, options, icon }: Props = $props()

  const counts = $derived(column?.getFacetedUniqueValues())
  const selected = $derived(
    new Set((column?.getFilterValue() as string[] | undefined) ?? []),
  )

  function toggle(value: string) {
    const next = new Set(selected)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    column?.setFilterValue(next.size ? [...next] : undefined)
  }
</script>

<Popover.Root>
  <Popover.Trigger>
    {#snippet child({ props })}
      <Button {...props} variant="outline" size="sm" class="h-8 border-dashed">
        <PlusCircle class="size-3.5" />
        {title}
        {#if selected.size > 0}
          <span class="mx-0.5 h-4 w-px bg-border"></span>
          {#if selected.size > 2}
            <Badge variant="secondary" class="rounded-sm px-1 font-normal">
              {selected.size} selected
            </Badge>
          {:else}
            {#each [...selected] as value (value)}
              <Badge variant="secondary" class="rounded-sm px-1 font-normal">
                {value}
              </Badge>
            {/each}
          {/if}
        {/if}
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class="w-56 p-0" align="start">
    <Command.Root>
      <Command.Input placeholder={title} />
      <Command.List>
        <Command.Empty>No results.</Command.Empty>
        <Command.Group>
          {#each options as option (option)}
            <Command.Item value={option} onSelect={() => toggle(option)}>
              <span
                class={cn(
                  'flex size-4 items-center justify-center rounded-[4px] border',
                  selected.has(option)
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'opacity-50',
                )}
              >
                {#if selected.has(option)}
                  <Check class="size-3" />
                {/if}
              </span>
              {@render icon?.(option)}
              <span class="truncate">{option}</span>
              <span class="ml-auto font-mono text-xs text-muted-foreground">
                {counts?.get(option) ?? 0}
              </span>
            </Command.Item>
          {/each}
        </Command.Group>
        {#if selected.size > 0}
          <Command.Separator />
          <Command.Group>
            <Command.Item
              value="Clear filter"
              class="justify-center text-center"
              onSelect={() => column?.setFilterValue(undefined)}
            >
              Clear filter
            </Command.Item>
          </Command.Group>
        {/if}
      </Command.List>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
