<script lang="ts" generics="TData">
  import Plus from '@lucide/svelte/icons/plus'
  import type { Table } from '@tanstack/table-core'
  import { Button } from '$lib/components/ui/button/index.js'
  import * as Popover from '$lib/components/ui/popover/index.js'
  import FilterConditionEditor from './FilterConditionEditor.svelte'

  type Props = {
    table: Table<TData>
    availableColumnIds: string[]
  }

  let { table, availableColumnIds }: Props = $props()

  let open = $state(false)

  function apply(columnId: string, operator: string, value: unknown) {
    table.getColumn(columnId)?.setFilterValue({ operator, value })
    open = false
  }
</script>

<Popover.Root bind:open>
  <Popover.Trigger>
    {#snippet child({ props })}
      <Button {...props} type="button" variant="outline" size="sm">
        <Plus class="h-4 w-4" />
        Add filter
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class="w-64 p-0" align="start">
    <FilterConditionEditor {table} {availableColumnIds} onapply={apply} />
  </Popover.Content>
</Popover.Root>
