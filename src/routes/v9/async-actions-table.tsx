import { createFileRoute } from '@tanstack/react-router'
import { AsyncActionsPage } from '#/components/v9/async-actions/async-actions-page'

export const Route = createFileRoute('/v9/async-actions-table')({
  head: () => ({
    meta: [
      {
        title:
          'Shadcn Table with Async Row Actions — TanStack Table v9 — ShadTable',
      },
      {
        name: 'description',
        content:
          'Shadcn table row actions that show real request state: spinning sync, Retry on failure, Undo for archive, confirm for delete. For TanStack Table v9.',
      },
      {
        property: 'og:title',
        content:
          'Shadcn Table with Async Row Actions — TanStack Table v9 — ShadTable',
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
          url: 'https://www.shad-table.dev/v9/async-actions-table',
          isAccessibleForFree: true,
          author: {
            '@type': 'Organization',
            name: 'coros-hq',
            url: 'https://github.com/coros-hq',
          },
        },
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://www.shad-table.dev/v9/async-actions-table',
      },
    ],
  }),
  component: AsyncActionsPage,
})
