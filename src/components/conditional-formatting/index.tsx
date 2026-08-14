import { columns, type InventoryItem } from './columns'
import { DataTable } from './data-table'

const data: InventoryItem[] = [
  { id: '1', product: 'Wireless Mouse', sku: 'WM-2201', stock: 128, reorderPoint: 40, marginPct: 38.5, status: 'In Stock' },
  { id: '2', product: 'USB-C Hub', sku: 'UCH-1140', stock: 12, reorderPoint: 25, marginPct: 22.0, status: 'Low Stock' },
  { id: '3', product: 'Mechanical Keyboard', sku: 'MK-7702', stock: 0, reorderPoint: 15, marginPct: 18.4, status: 'Backordered' },
  { id: '4', product: '27" Monitor', sku: 'MN-2701', stock: 6, reorderPoint: 10, marginPct: 8.2, status: 'Low Stock' },
  { id: '5', product: 'Laptop Stand', sku: 'LS-3390', stock: 240, reorderPoint: 50, marginPct: 41.7, status: 'In Stock' },
  { id: '6', product: 'Webcam 1080p', sku: 'WC-0087', stock: 4, reorderPoint: 10, marginPct: 6.9, status: 'Low Stock' },
  { id: '7', product: 'Bluetooth Speaker', sku: 'BS-5510', stock: 0, reorderPoint: 20, marginPct: 15.3, status: 'Backordered' },
  { id: '8', product: 'Wired Earbuds', sku: 'WE-0042', stock: 18, reorderPoint: 30, marginPct: 27.1, status: 'Discontinued' },
  { id: '9', product: 'Desk Lamp', sku: 'DL-1123', stock: 85, reorderPoint: 30, marginPct: 33.0, status: 'In Stock' },
  { id: '10', product: 'Cable Organizer', sku: 'CO-9981', stock: 300, reorderPoint: 60, marginPct: 52.4, status: 'In Stock' },
]

export function ConditionalFormattingTableDemo() {
  return <DataTable columns={columns} data={data} />
}
