import { useState } from 'react'

import { EditableTable } from './data-table'
import type { Product } from './columns'

const initialData: Product[] = [
  { id: 'SKU-001', name: 'Wireless Mouse', price: 29.99, stock: 142, category: 'Electronics' },
  { id: 'SKU-002', name: 'Mechanical Keyboard', price: 89.0, stock: 58, category: 'Electronics' },
  { id: 'SKU-003', name: 'Desk Lamp', price: 34.5, stock: 76, category: 'Home' },
  { id: 'SKU-004', name: 'Canvas Tote', price: 18.0, stock: 203, category: 'Clothing' },
  { id: 'SKU-005', name: 'Ceramic Mug', price: 12.99, stock: 310, category: 'Home' },
]

export function EditableTableDemo() {
  const [data, setData] = useState(initialData)

  return <EditableTable data={data} onDataChange={setData} />
}
