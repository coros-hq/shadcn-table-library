<script lang="ts" generics="T extends string">
  import { Checkbox } from '$lib/components/ui/checkbox/index.js'
  import { Label } from '$lib/components/ui/label/index.js'
  import { cn } from '$lib/utils.js'

  type Props = {
    label: string
    options: readonly T[]
    getLabel?: (value: T) => string
    selected: T[]
  }

  let {
    label,
    options,
    getLabel = (value) => value,
    selected = $bindable(),
  }: Props = $props()

  const id = $props.id()

  function toggle(value: T) {
    selected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value]
  }
</script>

<fieldset class="space-y-2">
  <legend class="text-sm font-medium">{label}</legend>
  <div class="flex flex-wrap gap-2">
    {#each options as option (option)}
      <Label
        for="{id}-{option}"
        class={cn(
          'flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm font-normal transition-colors',
          selected.includes(option)
            ? 'border-foreground/25 bg-muted/60'
            : 'text-muted-foreground',
        )}
      >
        <Checkbox
          id="{id}-{option}"
          checked={selected.includes(option)}
          onCheckedChange={() => toggle(option)}
        />
        {getLabel(option)}
      </Label>
    {/each}
  </div>
</fieldset>
