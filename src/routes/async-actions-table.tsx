import { createFileRoute } from '@tanstack/react-router'
import { AsyncActionsPage } from '#/components/async-actions/async-actions-page'

export const Route = createFileRoute('/async-actions-table')({
  head: () => ({
    meta: [
      { title: 'Shadcn Table with Async Row Actions — ShadTable' },
      {
        name: 'description',
        content:
          'A table with async row actions for shadcn/ui and TanStack Table. Table row actions with animated icons that reflect real request state: a sync icon that spins while pending, Retry on failure, Undo for archive, and a confirm step for delete.',
      },
      {
        property: 'og:title',
        content: 'Shadcn Table with Async Row Actions — ShadTable',
      },
      {
        property: 'og:description',
        content:
          'Animated row action buttons for shadcn/ui and TanStack Table that show pending, failed, undo, and confirm states.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Async Row Actions Table',
          description:
            'Row actions with animated icons that reflect pending, failed, undo, and confirm states.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
        },
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://www.shad-table.dev/async-actions-table',
      },
    ],
  }),
  component: AsyncActionsPage,
})
