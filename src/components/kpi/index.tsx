import { columns } from './columns'
import type { Kpi } from './kpi'
import { KpiTable } from './data-table'

const data: Kpi[] = [
  {
    id: 'revenue',
    label: 'Revenue',
    value: 128400,
    unit: 'currency',
    change: 8.2,
    trend: [92000, 95500, 101000, 98200, 110500, 115000, 120800, 128400],
  },
  {
    id: 'new-customers',
    label: 'New Customers',
    value: 482,
    unit: 'number',
    change: -3.4,
    trend: [520, 505, 512, 498, 510, 495, 470, 482],
  },
  {
    id: 'churn-rate',
    label: 'Churn Rate',
    value: 3.1,
    unit: 'percent',
    change: -0.4,
    trend: [4.1, 3.9, 3.8, 3.9, 3.6, 3.4, 3.3, 3.1],
  },
  {
    id: 'conversion-rate',
    label: 'Conversion Rate',
    value: 4.6,
    unit: 'percent',
    change: 0.3,
    trend: [3.9, 4.0, 4.1, 4.0, 4.3, 4.2, 4.4, 4.6],
  },
  {
    id: 'avg-order-value',
    label: 'Avg Order Value',
    value: 64.2,
    unit: 'currency',
    change: 1.1,
    trend: [59.5, 60.1, 61.0, 60.4, 62.2, 61.8, 63.0, 64.2],
  },
]

export function KpiTableDemo() {
  return <KpiTable columns={columns} data={data} />
}
