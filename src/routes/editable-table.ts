import { createFileRoute } from '@tanstack/react-router'
import { EditableTablePage } from '#/components/editable/editable-table-page'

export const Route = createFileRoute('/editable-table')({
  component: EditableTablePage,
})
