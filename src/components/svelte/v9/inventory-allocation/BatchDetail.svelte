<script lang="ts">
  import Wand2 from '@lucide/svelte/icons/wand-sparkles'
  import * as Table from '$lib/components/ui/table/index.js'
  import { Badge } from '$lib/components/ui/badge/index.js'
  import { Button } from '$lib/components/ui/button/index.js'
  import { cn } from '$lib/utils.js'
  import type { InventoryTableMeta, SkuRow } from './columns'
  import EditableNumberCell from './EditableNumberCell.svelte'
  import { deriveMetrics, isExpired } from './formulas'

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    })

  let { row, meta }: { row: SkuRow; meta: InventoryTableMeta } = $props()

  const metrics = $derived(deriveMetrics(row))
  const earliestUsable = $derived(
    [...row.batches]
      .filter((b) => !isExpired(b))
      .sort((a, b) => a.expiresOn.localeCompare(b.expiresOn))[0]?.id,
  )

  // Everything allocated to this SKU except this batch — the ceiling for a new
  // value here is whatever's left of orderedQty.
  function validateAllocation(batch: SkuRow['batches'][number], n: number) {
    const allocatedElsewhere = metrics.allocated - batch.allocated
    if (n > batch.onHand) return `Only ${batch.onHand} on hand`
    if (allocatedElsewhere + n > row.orderedQty) {
      return `Max ${row.orderedQty - allocatedElsewhere} — order is ${row.orderedQty}`
    }
    return null
  }
</script>

<!-- The detail cell spans every column of a wide, horizontally scrolling
     grid — cap the panel's width and pin it left so it stays readable and
     in view however far the master table is scrolled. -->
<div class="sticky left-4 max-w-2xl space-y-3">
  <div class="flex flex-wrap items-center justify-between gap-2">
    <p class="text-sm text-muted-foreground">
      <span class="font-medium text-foreground">{row.orderedQty.toLocaleString()}</span>
      units on open orders ·
      <span class="font-medium text-foreground">{metrics.allocated.toLocaleString()}</span>
      allocated
      {#if metrics.unallocated > 0}
        ·
        <span class="font-medium text-amber-700 dark:text-amber-400">
          {metrics.unallocated.toLocaleString()} still open
        </span>
      {/if}
    </p>
    <Button
      type="button"
      variant="outline"
      size="sm"
      onclick={() => meta.autoAllocate(row.sku)}
    >
      <Wand2 class="size-3.5" />
      Auto-allocate (FEFO)
    </Button>
  </div>

  <div class="overflow-hidden rounded-md border bg-background">
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head>Lot</Table.Head>
          <Table.Head>Location</Table.Head>
          <Table.Head>Expires</Table.Head>
          <Table.Head class="text-right">On hand</Table.Head>
          <Table.Head>Allocated</Table.Head>
          <Table.Head class="text-right">Free</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each row.batches as batch (batch.id)}
          <Table.Row class={cn(isExpired(batch) && 'text-muted-foreground')}>
            <Table.Cell class="font-mono text-xs">{batch.lot}</Table.Cell>
            <Table.Cell>{batch.location}</Table.Cell>
            <Table.Cell>
              <span class="flex items-center gap-2 whitespace-nowrap">
                {formatDate(batch.expiresOn)}
                {#if isExpired(batch)}
                  <Badge
                    variant="outline"
                    class="border-transparent bg-destructive/15 text-destructive dark:text-red-300"
                  >
                    Expired
                  </Badge>
                {:else if batch.id === earliestUsable}
                  <Badge variant="outline">Pick first</Badge>
                {/if}
              </span>
            </Table.Cell>
            <Table.Cell class="text-right tabular-nums">
              {batch.onHand.toLocaleString()}
            </Table.Cell>
            <Table.Cell>
              <EditableNumberCell
                label="Allocated from lot {batch.lot}"
                value={batch.allocated}
                disabled={isExpired(batch)}
                validate={(n) => validateAllocation(batch, n)}
                oncommit={(n) => meta.updateBatch(row.sku, batch.id, n)}
              />
            </Table.Cell>
            <Table.Cell class="text-right tabular-nums">
              {isExpired(batch) ? '—' : (batch.onHand - batch.allocated).toLocaleString()}
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
</div>
