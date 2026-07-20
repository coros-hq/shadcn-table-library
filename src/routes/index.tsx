import { createFileRoute } from '@tanstack/react-router'
import { DataTable } from '@/components/example/data-table'
import { columns } from '@/components/example/columns'
import type { Payment } from '@/components/example/columns'

export const Route = createFileRoute('/')({ component: Home })

async function getData(): Promise<Payment[]> {
  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    // ...
  ]
}


async function Home() {
  const data = await getData()
  return (
    <div>
      <h1>ShadCn Table Library</h1>
      <div className="container mx-auto py-10">
          <DataTable columns={columns} data={data} />
        </div>
    </div>
  )
}
