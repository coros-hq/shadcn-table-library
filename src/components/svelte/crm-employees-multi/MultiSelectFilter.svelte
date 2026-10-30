<script lang="ts">
  import PlusCircle from '@lucide/svelte/icons/circle-plus'
  import { Badge } from '$lib/components/ui/badge/index.js'
  import { Button } from '$lib/components/ui/button/index.js'
  import { Checkbox } from '$lib/components/ui/checkbox/index.js'
  import * as Command from '$lib/components/ui/command/index.js'
  import * as Popover from '$lib/components/ui/popover/index.js'

  type Props = {
    title: string
    options: { label: string; value: string; count?: number }[]
    selected: string[]
  }

  let { title, options, selected = $bindable() }: Props = $props()

  function toggle(value: string) {
    selected = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value]
  }
</script>

<Popover.Root>
  <Popover.Trigger>
    {#snippet child({ props })}
      <Button {...props} variant="outline" size="sm">
        <PlusCircle class="mr-2 h-4 w-4" />
        {title}
        {#if selected.length > 0}
          <Badge variant="secondary" class="ml-2">
            {selected.length}
          </Badge>
        {/if}
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class="w-[200px] p-0" align="start">
    <Command.Root>
      <Command.Input placeholder={title} />
      <Command.List>
        <Command.Group>
          <!-- The label is the searchable value; the option's own value is what gets toggled -->
          {#each options as option (option.value)}
            <Command.Item value={option.label} onSelect={() => toggle(option.value)}>
              <Checkbox
                checked={selected.includes(option.value)}
                class="pointer-events-none mr-2 [&_svg]:text-primary-foreground!"
                tabindex={-1}
              />
              <span>{option.label}</span>
              {#if option.count !== undefined}
                <span class="ml-auto text-xs text-muted-foreground">
                  {option.count}
                </span>
              {/if}
            </Command.Item>
          {/each}
        </Command.Group>
      </Command.List>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
