import { createFileRoute } from '@tanstack/react-router'
import { AnimatedIconsTablePage } from '#/components/v9/animated-icons/animated-icons-table-page'

export const Route = createFileRoute('/v9/animated-icons-table')({
  head: () => ({
    meta: [
      {
        title:
          'Shadcn Table with Animated Icons — TanStack Table v9 — ShadTable',
      },
      {
        name: 'description',
        content:
          'Table with animated row-action icons for shadcn/ui and TanStack Table: favorite, notify, archive and delete with Iconimate. For TanStack Table v9.',
      },
      {
        property: 'og:title',
        content:
          'Shadcn Table with Animated Icons — TanStack Table v9 — ShadTable',
      },
      {
        property: 'og:description',
        content:
          'A data table whose row actions use Iconimate animated icons instead of static glyphs, built on shadcn/ui and TanStack Table.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Animated Icons Table',
          description:
            'A data table with row actions built from Iconimate animated icons: favorite, notify, archive, and delete.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
          url: 'https://www.shad-table.dev/v9/animated-icons-table',
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
        href: 'https://www.shad-table.dev/v9/animated-icons-table',
      },
    ],
  }),
  component: AnimatedIconsTablePage,
})
