import { createFileRoute } from '@tanstack/react-router'
import { ResizableTablePage } from '#/components/resizable-reorder/resizable-table-page'

export const Route = createFileRoute('/resizable-table')({
  component: ResizableTablePage,
})
