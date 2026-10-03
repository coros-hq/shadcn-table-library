<script setup lang="ts">
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Order } from './columns'
import { currency } from './columns'

defineProps<{ order: Order }>()
</script>

<template>
  <div class="grid gap-4 py-1 md:grid-cols-[minmax(0,200px)_1fr]">
    <div class="space-y-1 text-sm">
      <p class="font-medium text-foreground">Shipping address</p>
      <p class="text-muted-foreground">{{ order.shippingAddress }}</p>
    </div>
    <div class="overflow-hidden rounded-md border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Qty</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Subtotal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="item in order.items" :key="item.product">
            <TableCell>{{ item.product }}</TableCell>
            <TableCell>{{ item.qty }}</TableCell>
            <TableCell>{{ currency(item.price) }}</TableCell>
            <TableCell>{{ currency(item.qty * item.price) }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
