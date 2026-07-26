import { createFileRoute } from '@tanstack/react-router'
import { TreeReorderPage } from '#/components/tree-reorder/tree-reorder-page'

export const Route = createFileRoute('/tree-reorder')({
  component: TreeReorderPage,
})
