import { useCallback, useEffect, useRef, useState } from 'react'
import { RotateCw } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { DataTable } from './data-table'
import { fetchInvoices } from './data'
import type { Invoice } from './data'

export function LoadingStateTableDemo() {
  const [data, setData] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const requestId = useRef(0)

  const load = useCallback(async (mode: 'initial' | 'refetch') => {
    const id = ++requestId.current
    if (mode === 'initial') {
      setData([])
      setIsLoading(true)
    } else {
      setIsFetching(true)
    }
    const result = await fetchInvoices()
    // Ignore a response that a newer request has already superseded
    if (id !== requestId.current) return
    setData(result)
    setIsLoading(false)
    setIsFetching(false)
  }, [])

  useEffect(() => {
    void load('initial')
  }, [load])

  const busy = isLoading || isFetching

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => load('initial')}
        >
          <RotateCw /> Reload (skeleton)
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={busy || data.length === 0}
          onClick={() => load('refetch')}
        >
          <RotateCw /> Refetch (keep rows)
        </Button>
      </div>
      <DataTable data={data} isLoading={isLoading} isFetching={isFetching} />
    </div>
  )
}
