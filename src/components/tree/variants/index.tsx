import { columns } from './columns'
import { products } from './data'
import { VariantsTable } from './data-table'

export function VariantsTableDemo() {
  return <VariantsTable columns={columns} data={products} />
}
