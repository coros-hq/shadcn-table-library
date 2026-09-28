import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/v9/')({
  beforeLoad: () => {
    throw redirect({ to: '/v9/data-table' })
  },
})
