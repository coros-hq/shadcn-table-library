import { useState } from 'react'

import { Button } from '#/components/ui/button'
import { DataTable } from './data-table'
import { invoices } from './data'
import type { Invoice } from './data'

export function EmptyStateTableDemo() {
  const [data, setData] = useState<Invoice[]>([])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setData([])}
          disabled={data.length === 0}
        >
          Empty the table
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setData(invoices)}
          disabled={data.length > 0}
        >
          Load invoices
        </Button>
      </div>
      <DataTable data={data} onCreate={() => setData(invoices)} />
    </div>
  )
}
