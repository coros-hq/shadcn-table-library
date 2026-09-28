import { columns } from './columns'
import { LogsSidePanelTable } from './side-panel-data-table'
import { logs } from './data'

export function LogsSidePanelDemo() {
  return <LogsSidePanelTable columns={columns} data={logs} />
}
