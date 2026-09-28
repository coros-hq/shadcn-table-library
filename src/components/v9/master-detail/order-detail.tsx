import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import type { Order } from './columns'
import { currency } from './columns'

export function OrderDetail({ order }: { order: Order }) {
  return (
    <div className="grid gap-4 py-1 md:grid-cols-[minmax(0,200px)_1fr]">
      <div className="space-y-1 text-sm">
        <p className="font-medium text-foreground">Shipping address</p>
        <p className="text-muted-foreground">{order.shippingAddress}</p>
      </div>
      <div className="overflow-hidden rounded-md border bg-background">
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
            {order.items.map((item) => (
              <TableRow key={item.product}>
                <TableCell>{item.product}</TableCell>
                <TableCell>{item.qty}</TableCell>
                <TableCell>{currency(item.price)}</TableCell>
                <TableCell>{currency(item.qty * item.price)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
