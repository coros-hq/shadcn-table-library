import { useState } from 'react'

import { AnimatedIconsTable } from './data-table'
import type { TeamMember } from './columns'

const initialData: TeamMember[] = [
  { id: '1', name: 'Amelia Frost', email: 'amelia@acme.dev', role: 'Engineering', favorite: true, notify: true, archived: false },
  { id: '2', name: 'Noah Park', email: 'noah@acme.dev', role: 'Design', favorite: false, notify: true, archived: false },
  { id: '3', name: 'Sofia Reyes', email: 'sofia@acme.dev', role: 'Product', favorite: false, notify: false, archived: false },
  { id: '4', name: 'Liam Chen', email: 'liam@acme.dev', role: 'Engineering', favorite: false, notify: false, archived: true },
  { id: '5', name: 'Maya Okafor', email: 'maya@acme.dev', role: 'Support', favorite: true, notify: false, archived: false },
]

export function AnimatedIconsTableDemo() {
  const [data, setData] = useState(initialData)

  return (
    <AnimatedIconsTable
      data={data}
      onDataChange={setData}
      onReset={() => setData(initialData)}
    />
  )
}
