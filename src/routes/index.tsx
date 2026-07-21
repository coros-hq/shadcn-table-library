import { BasicTableUsage } from '#/components/basic'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })



async function Home() {
  return (
    <div className='container mx-auto py-10 space-y-4'>
      <h1 className='font-semibold'>ShadCn Table Library</h1>
      <div>
        <BasicTableUsage />
      </div>
    </div>
  )
}
