<script lang="ts" generics="TData">
  import type { Table } from '@tanstack/table-core'
  import { Button } from '$lib/components/ui/button/index.js'
  import * as Popover from '$lib/components/ui/popover/index.js'
  import FilterConditionEditor from './FilterConditionEditor.svelte'
  import { formatConditionValue, operatorRegistry } from './operators'
  import type { FilterCondition } from './operators'
  import './types'

  type Props = {
    table: Table<TData>
    condition: FilterCondition
  }

  let { table, condition }: Props = $props()

  let open = $state(false)

  const meta = $derived(table.getColumn(condition.columnId)?.columnDef.meta)
  const activeOperator = $derived(
    meta?.filterVariant
      ? operatorRegistry[meta.filterVariant].find((o) => o.value === condition.operator)
      : undefined,
  )
  const valueDisplay = $derived(
    meta?.filterVariant
      ? formatConditionValue(
          meta.filterVariant,
          activeOperator,
          condition.value,
          meta.filterOptions,
        )
      : '',
  )

  function apply(columnId: string, operator: string, value: unknown) {
    table.getColumn(columnId)?.setFilterValue({ operator, value })
    open = false
  }

  function remove() {
    table.getColumn(condition.columnId)?.setFilterValue(undefined)
    open = false
  }
</script>

{#if meta?.filterVariant}
  <Popover.Root bind:open>
    <Popover.Trigger>
      {#snippet child({ props })}
        <Button {...props} type="button" variant="outline" size="sm">
          <span>{meta.label}</span>
          <span class="text-muted-foreground">{activeOperator?.label}</span>
          {#if valueDisplay}
            <span class="font-medium">{valueDisplay}</span>
          {/if}
        </Button>
      {/snippet}
    </Popover.Trigger>
    <Popover.Content class="w-64 p-0" align="start">
      <FilterConditionEditor
        {table}
        columnId={condition.columnId}
        initialOperator={condition.operator}
        initialValue={condition.value}
        removable
        onapply={apply}
        onremove={remove}
      />
    </Popover.Content>
  </Popover.Root>
{/if}
