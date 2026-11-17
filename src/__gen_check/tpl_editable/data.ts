export type Row = {
  id: string
  name: string
  price: number
  stock: number
  category: string
  active: boolean
}

// Sample data. Replace it with your own rows (or a fetch) of the same shape.
export const rows: Row[] = [
  {
    id: '1',
    name: 'Website redesign',
    price: 4193,
    stock: 7602,
    category: 'Clothing',
    active: true,
  },
  {
    id: '2',
    name: 'Q3 campaign',
    price: 1468,
    stock: 4877,
    category: 'Home',
    active: false,
  },
  {
    id: '3',
    name: 'Onboarding flow',
    price: 8643,
    stock: 2152,
    category: 'Electronics',
    active: false,
  },
  {
    id: '4',
    name: 'Billing migration',
    price: 5918,
    stock: 9327,
    category: 'Clothing',
    active: true,
  },
  {
    id: '5',
    name: 'Mobile app',
    price: 3193,
    stock: 6602,
    category: 'Home',
    active: false,
  },
  {
    id: '6',
    name: 'Help center',
    price: 468,
    stock: 3877,
    category: 'Electronics',
    active: false,
  },
  {
    id: '7',
    name: 'Pricing page',
    price: 7643,
    stock: 1152,
    category: 'Clothing',
    active: true,
  },
  {
    id: '8',
    name: 'Data pipeline',
    price: 4918,
    stock: 8327,
    category: 'Home',
    active: false,
  },
  {
    id: '9',
    name: 'Brand refresh',
    price: 2193,
    stock: 5602,
    category: 'Electronics',
    active: false,
  },
  {
    id: '10',
    name: 'Partner portal',
    price: 9368,
    stock: 2877,
    category: 'Clothing',
    active: true,
  },
  {
    id: '11',
    name: 'Search upgrade',
    price: 6643,
    stock: 152,
    category: 'Home',
    active: false,
  },
  {
    id: '12',
    name: 'Accessibility audit',
    price: 3918,
    stock: 7327,
    category: 'Electronics',
    active: false,
  },
]
