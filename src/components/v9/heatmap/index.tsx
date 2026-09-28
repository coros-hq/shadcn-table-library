import { months, revenueByRegion } from './data'
import { HeatmapTable } from './data-table'

export function HeatmapTableDemo() {
  return (
    <HeatmapTable
      columns={months}
      data={revenueByRegion}
      formatValue={(value) => `$${value}k`}
    />
  )
}
