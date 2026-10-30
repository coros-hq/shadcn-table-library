<script lang="ts">
  import { getCoreRowModel, type ColumnDef } from '@tanstack/table-core'
  import {
    FlexRender,
    createSvelteTable,
    renderComponent,
  } from '$lib/components/ui/data-table/index.js'
  import * as Table from '$lib/components/ui/table/index.js'
  import { Button } from '$lib/components/ui/button/index.js'
  import { cn } from '$lib/utils.js'
  import FeatureLabel from './FeatureLabel.svelte'
  import FeatureValueCell from './FeatureValueCell.svelte'
  import type { Feature, FeatureValue, Plan } from './comparison'

  let { plans, features }: { plans: Plan[]; features: Feature[] } = $props()

  const columns = $derived<ColumnDef<Feature>[]>([
    {
      id: 'feature',
      header: '',
      accessorKey: 'label',
      cell: ({ getValue }) =>
        renderComponent(FeatureLabel, { label: getValue() as string }),
    },
    ...plans.map(
      (plan): ColumnDef<Feature> => ({
        id: plan.id,
        header: plan.name,
        accessorFn: (feature) => feature.values[plan.id],
        cell: ({ getValue }) =>
          renderComponent(FeatureValueCell, {
            value: getValue() as FeatureValue,
          }),
      }),
    ),
  ])

  const table = createSvelteTable({
    get data() {
      return features
    },
    get columns() {
      return columns
    },
    getCoreRowModel: getCoreRowModel(),
  })

  const isHighlighted = (columnId: string) =>
    plans.find((p) => p.id === columnId)?.highlighted
</script>

<div class="overflow-hidden rounded-md border">
  <Table.Root>
    <Table.Header>
      <Table.Row>
        <Table.Head />
        {#each plans as plan (plan.id)}
          <Table.Head
            class={cn(
              'py-4 align-bottom text-center',
              plan.highlighted && 'bg-primary/5',
            )}
          >
            <div class="space-y-1">
              <p class="text-sm font-semibold text-foreground">
                {plan.name}
              </p>
              <p class="text-2xl font-bold text-foreground">
                {plan.price}
                <span class="text-sm font-normal text-muted-foreground">
                  {plan.period}
                </span>
              </p>
              <Button
                type="button"
                size="sm"
                variant={plan.highlighted ? 'default' : 'outline'}
                class="mt-2 w-full"
              >
                {plan.cta}
              </Button>
            </div>
          </Table.Head>
        {/each}
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {#each table.getRowModel().rows as row (row.id)}
        <Table.Row>
          {#each row.getVisibleCells() as cell (cell.id)}
            <Table.Cell class={cn(isHighlighted(cell.column.id) && 'bg-primary/5')}>
              <FlexRender
                content={cell.column.columnDef.cell}
                context={cell.getContext()}
              />
            </Table.Cell>
          {/each}
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
</div>
