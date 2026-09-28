import { columns } from './columns'
import { DeploymentsTable } from './data-table'
import { deployments } from './data'

export function DeploymentsDemo() {
  return <DeploymentsTable columns={columns} data={deployments} />
}
