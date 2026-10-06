import { SpreadsheetTable } from './data-table'
import { initialSheet } from './data'

export function SpreadsheetDemo() {
  return <SpreadsheetTable initialData={initialSheet()} />
}
