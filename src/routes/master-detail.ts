import { createFileRoute } from '@tanstack/react-router'
import { MasterDetailPage } from '#/components/master-detail/master-detail-page'

export const Route = createFileRoute('/master-detail')({
  component: MasterDetailPage,
})
