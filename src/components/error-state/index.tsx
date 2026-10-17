import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '#/components/ui/button'
import { DataTable } from './data-table'
import { invoices } from './data'
import type { Invoice } from './data'

export function ErrorStateTableDemo() {
  const [data, setData] = useState<Invoice[]>([])
  const [error, setError] = useState<Error | null>(
    new Error('Request failed with status 503'),
  )
  const [isRetrying, setIsRetrying] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  // Stand-in for refetching: succeeds after a short delay
  const retry = useCallback(() => {
    setIsRetrying(true)
    timer.current = setTimeout(() => {
      setData(invoices)
      setError(null)
      setIsRetrying(false)
    }, 1200)
  }, [])

  const failWith = (rows: Invoice[]) => {
    clearTimeout(timer.current)
    setIsRetrying(false)
    setData(rows)
    setError(new Error('Request failed with status 503'))
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => failWith([])}>
          Fail with no data
        </Button>
        <Button variant="outline" size="sm" onClick={() => failWith(invoices)}>
          Fail with stale data
        </Button>
      </div>
      <DataTable
        data={data}
        error={error}
        onRetry={retry}
        isRetrying={isRetrying}
      />
    </div>
  )
}
