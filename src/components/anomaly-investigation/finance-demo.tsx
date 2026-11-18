import { AnomalyInvestigationDemo } from './index'
import { finance } from './finance'

/** The same table over a company's daily money in and out */
export function FinanceAnomalyDemo() {
  return <AnomalyInvestigationDemo metrics={finance} />
}
