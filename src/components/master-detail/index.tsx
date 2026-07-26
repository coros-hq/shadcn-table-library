import { columns } from './columns'
import type { Order } from './columns'
import { MasterDetailTable } from './data-table'

const data: Order[] = [
  {
    id: 'ORD-1001',
    customer: 'Ava Thompson',
    date: '2026-06-02',
    status: 'Delivered',
    total: 154.97,
    shippingAddress: '221 Baker St, Springfield, IL',
    items: [
      { product: 'Wireless Mouse', qty: 1, price: 29.99 },
      { product: 'Mechanical Keyboard', qty: 1, price: 89.0 },
      { product: 'USB-C Hub', qty: 2, price: 17.99 },
    ],
  },
  {
    id: 'ORD-1002',
    customer: 'Liam Chen',
    date: '2026-06-04',
    status: 'Processing',
    total: 42.5,
    shippingAddress: '88 Market Ave, Austin, TX',
    items: [{ product: 'Phone Case', qty: 2, price: 21.25 }],
  },
  {
    id: 'ORD-1003',
    customer: 'Sofia Patel',
    date: '2026-06-05',
    status: 'Delivered',
    total: 310.0,
    shippingAddress: '14 Harbor Rd, Seattle, WA',
    items: [
      { product: '27" Monitor', qty: 1, price: 249.0 },
      { product: 'Monitor Arm', qty: 1, price: 61.0 },
    ],
  },
  {
    id: 'ORD-1004',
    customer: 'Noah Garcia',
    date: '2026-06-06',
    status: 'Cancelled',
    total: 18.99,
    shippingAddress: '5 Elm Court, Denver, CO',
    items: [{ product: 'Cable Sleeve', qty: 1, price: 18.99 }],
  },
]

export function MasterDetailDemo() {
  return <MasterDetailTable columns={columns} data={data} />
}
