<script lang="ts">
  import * as Table from '$lib/components/ui/table/index.js'
  import type { Order } from './columns'
  import { currency } from './columns'

  let { order }: { order: Order } = $props()
</script>

<div class="grid gap-4 py-1 md:grid-cols-[minmax(0,200px)_1fr]">
  <div class="space-y-1 text-sm">
    <p class="font-medium text-foreground">Shipping address</p>
    <p class="text-muted-foreground">{order.shippingAddress}</p>
  </div>
  <div class="overflow-hidden rounded-md border bg-background">
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head>Product</Table.Head>
          <Table.Head>Qty</Table.Head>
          <Table.Head>Price</Table.Head>
          <Table.Head>Subtotal</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each order.items as item (item.product)}
          <Table.Row>
            <Table.Cell>{item.product}</Table.Cell>
            <Table.Cell>{item.qty}</Table.Cell>
            <Table.Cell>{currency(item.price)}</Table.Cell>
            <Table.Cell>{currency(item.qty * item.price)}</Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
</div>
