import { useState } from 'react'

import { LiveStatusTable } from './data-table'
import type { Service } from './columns'

const initialData: Service[] = [
  { id: '1', name: 'api-gateway', region: 'us-east-1', status: 'operational', latencyMs: 42, uptime: 99.98 },
  { id: '2', name: 'auth-service', region: 'us-east-1', status: 'operational', latencyMs: 61, uptime: 99.95 },
  { id: '3', name: 'payments-service', region: 'eu-west-1', status: 'degraded', latencyMs: 180, uptime: 99.72 },
  { id: '4', name: 'search-index', region: 'us-west-2', status: 'operational', latencyMs: 35, uptime: 99.99 },
  { id: '5', name: 'notifications-worker', region: 'ap-southeast-1', status: 'operational', latencyMs: 88, uptime: 99.9 },
  { id: '6', name: 'billing-cron', region: 'eu-west-1', status: 'down', latencyMs: 0, uptime: 98.41 },
]

export function LiveStatusTableDemo() {
  const [data, setData] = useState(initialData)

  return <LiveStatusTable data={data} onDataChange={setData} />
}
