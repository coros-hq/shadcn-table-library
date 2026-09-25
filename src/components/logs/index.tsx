import { columns } from './columns'
import { LogsTable } from './data-table'
import { logs } from './data'

export function LogsDemo() {
  return <LogsTable columns={columns} data={logs} />
}
