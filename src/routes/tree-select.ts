import { createFileRoute } from '@tanstack/react-router'
import { TreeSelectPage } from '#/components/tree-select/tree-select-page'

export const Route = createFileRoute('/tree-select')({
  component: TreeSelectPage,
})
