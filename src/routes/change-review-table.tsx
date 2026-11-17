import { createFileRoute } from '@tanstack/react-router'
import { ChangeReviewTablePage } from '#/components/change-review/change-review-table-page'

export const Route = createFileRoute('/change-review-table')({
  head: () => ({
    meta: [
      { title: 'Shadcn Diff / Change Review Table — ShadTable' },
      {
        name: 'description',
        content:
          'Change review table for shadcn/ui and TanStack Table: compare old and new values, highlight changes, and accept or reject each one before a bulk update.',
      },
      {
        property: 'og:title',
        content: 'Shadcn Diff / Change Review Table — ShadTable',
      },
      {
        property: 'og:description',
        content:
          'Review a bulk update field by field: old and new values side by side, per-change and per-row accept or reject, and apply only what was accepted.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Diff / Change Review Table',
          description:
            'A diff table for reviewing bulk updates, with per-field accept and reject.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
          url: 'https://www.shad-table.dev/change-review-table',
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
        href: 'https://www.shad-table.dev/change-review-table',
      },
    ],
  }),
  component: ChangeReviewTablePage,
})
