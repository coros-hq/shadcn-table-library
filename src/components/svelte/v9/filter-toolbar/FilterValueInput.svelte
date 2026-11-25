<script lang="ts">
  import { Input } from '$lib/components/ui/input/index.js'
  import * as Select from '$lib/components/ui/select/index.js'
  import MultiSelectFilter from '$lib/components/ui/multi-select-filter/MultiSelectFilter.svelte'
  import DateRangeFilter from './DateRangeFilter.svelte'
  import type { OperatorDef } from './operators'
  import type { DateRangeValue, FilterOption, FilterVariant } from './types'

  /**
   * Renders the value control for a condition's valueShape/variant pair.
   * `operator.valueShape` decides whether anything renders at all ("is empty"
   * needs no value); `variant` decides which control fills a given shape,
   * reusing the same DateRangeFilter/MultiSelectFilter used elsewhere.
   */
  type Props = {
    label: string
    variant: FilterVariant
    operator: OperatorDef
    options?: FilterOption[]
    value?: unknown
  }

  let { label, variant, operator, options, value = $bindable() }: Props = $props()

  const focus = (el: HTMLInputElement) => el.focus()
</script>

{#if operator.valueShape !== 'none'}
  {#if variant === 'text'}
    <Input
      {@attach focus}
      placeholder="Value"
      class="w-full"
      value={(value as string | undefined) ?? ''}
      oninput={(e) => (value = e.currentTarget.value)}
    />
  {:else if variant === 'number'}
    <Input
      {@attach focus}
      type="number"
      placeholder="Value"
      class="w-full"
      value={(value as number | undefined) ?? ''}
      oninput={(e) => {
        const el = e.currentTarget
        value = el.value === '' ? undefined : el.valueAsNumber
      }}
    />
  {:else if variant === 'select'}
    <Select.Root
      type="single"
      value={(value as string | undefined) ?? ''}
      onValueChange={(next) => (value = next)}
    >
      <Select.Trigger class="w-full">
        {options?.find((option) => option.value === value)?.label ?? 'Select value'}
      </Select.Trigger>
      <Select.Content>
        <Select.Group>
          {#each options ?? [] as option (option.value)}
            <Select.Item value={option.value} label={option.label}>
              {option.label}
            </Select.Item>
          {/each}
        </Select.Group>
      </Select.Content>
    </Select.Root>
  {:else if variant === 'multiSelect'}
    <MultiSelectFilter
      title={label}
      options={options ?? []}
      bind:selected={() => (value as string[] | undefined) ?? [], (next) => (value = next)}
    />
  {:else if variant === 'dateRange'}
    <DateRangeFilter
      {label}
      bind:value={() => value as DateRangeValue | undefined, (next) => (value = next)}
    />
  {/if}
{/if}
