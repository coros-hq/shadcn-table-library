import { features, plans } from './data'
import { ComparisonTable } from './data-table'

export function ComparisonTableDemo() {
  return <ComparisonTable plans={plans} features={features} />
}
