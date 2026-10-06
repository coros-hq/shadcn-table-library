export type OrderStatus = 'Processing' | 'Shipped' | 'Delivered'
export type ShipmentStatus =
  'Label created' | 'In transit' | 'Out for delivery' | 'Delivered'

export type ShipmentEvent = {
  label: string
  location: string
  at: string
}

export type Shipment = {
  kind: 'shipment'
  id: string
  carrier: string
  tracking: string
  status: ShipmentStatus
  destination: string
  address: string
  items: number
  weightKg: number
  eta: string
  events: ShipmentEvent[]
}

export type Order = {
  kind: 'order'
  id: string
  number: string
  customer: string
  email: string
  status: OrderStatus
  total: number
  placedAt: string
  // A tuple, so the type itself says every order has exactly one shipment
  children: [Shipment]
}

export type TreeRow = Order | Shipment

export const orders: Order[] = [
  {
    kind: 'order',
    id: 'order-1042',
    number: '#1042',
    customer: 'Ava Thompson',
    email: 'ava.thompson@example.com',
    status: 'Shipped',
    total: 243.5,
    placedAt: '2026-10-01T09:12:00Z',
    children: [
      {
        kind: 'shipment',
        id: 'ship-1042',
        carrier: 'UPS',
        tracking: '1Z999AA10123456784',
        status: 'In transit',
        destination: 'Austin, TX',
        address: '2214 Congress Ave, Austin, TX 78701',
        items: 3,
        weightKg: 2.4,
        eta: '2026-10-08',
        events: [
          {
            label: 'Label created',
            location: 'Reno, NV',
            at: '2026-10-02T08:30:00Z',
          },
          {
            label: 'Picked up',
            location: 'Reno, NV',
            at: '2026-10-02T16:45:00Z',
          },
          {
            label: 'Arrived at hub',
            location: 'Salt Lake City, UT',
            at: '2026-10-04T05:10:00Z',
          },
          {
            label: 'Departed hub',
            location: 'Salt Lake City, UT',
            at: '2026-10-04T21:00:00Z',
          },
        ],
      },
    ],
  },
  {
    kind: 'order',
    id: 'order-1043',
    number: '#1043',
    customer: 'Liam Chen',
    email: 'liam.chen@example.com',
    status: 'Delivered',
    total: 89,
    placedAt: '2026-09-27T14:40:00Z',
    children: [
      {
        kind: 'shipment',
        id: 'ship-1043',
        carrier: 'DHL',
        tracking: 'JD014600003SE',
        status: 'Delivered',
        destination: 'Seattle, WA',
        address: '801 Pine St, Seattle, WA 98101',
        items: 1,
        weightKg: 0.8,
        eta: '2026-10-01',
        events: [
          {
            label: 'Label created',
            location: 'Reno, NV',
            at: '2026-09-28T07:00:00Z',
          },
          {
            label: 'In transit',
            location: 'Portland, OR',
            at: '2026-09-29T12:20:00Z',
          },
          {
            label: 'Out for delivery',
            location: 'Seattle, WA',
            at: '2026-10-01T08:05:00Z',
          },
          {
            label: 'Delivered',
            location: 'Seattle, WA',
            at: '2026-10-01T13:32:00Z',
          },
        ],
      },
    ],
  },
  {
    kind: 'order',
    id: 'order-1044',
    number: '#1044',
    customer: 'Sofia Patel',
    email: 'sofia.patel@example.com',
    status: 'Processing',
    total: 512.25,
    placedAt: '2026-10-05T18:03:00Z',
    children: [
      {
        kind: 'shipment',
        id: 'ship-1044',
        carrier: 'FedEx',
        tracking: '794644790138',
        status: 'Label created',
        destination: 'Chicago, IL',
        address: '350 N Orleans St, Chicago, IL 60654',
        items: 5,
        weightKg: 6.1,
        eta: '2026-10-11',
        events: [
          {
            label: 'Label created',
            location: 'Reno, NV',
            at: '2026-10-06T07:15:00Z',
          },
        ],
      },
    ],
  },
  {
    kind: 'order',
    id: 'order-1045',
    number: '#1045',
    customer: 'Noah Garcia',
    email: 'noah.garcia@example.com',
    status: 'Shipped',
    total: 67.8,
    placedAt: '2026-10-03T11:25:00Z',
    children: [
      {
        kind: 'shipment',
        id: 'ship-1045',
        carrier: 'USPS',
        tracking: '9400111899223197428490',
        status: 'Out for delivery',
        destination: 'Denver, CO',
        address: '1550 Wewatta St, Denver, CO 80202',
        items: 2,
        weightKg: 1.2,
        eta: '2026-10-06',
        events: [
          {
            label: 'Label created',
            location: 'Reno, NV',
            at: '2026-10-03T15:00:00Z',
          },
          {
            label: 'Accepted',
            location: 'Reno, NV',
            at: '2026-10-03T18:20:00Z',
          },
          {
            label: 'Arrived at facility',
            location: 'Denver, CO',
            at: '2026-10-05T04:48:00Z',
          },
          {
            label: 'Out for delivery',
            location: 'Denver, CO',
            at: '2026-10-06T06:30:00Z',
          },
        ],
      },
    ],
  },
]
