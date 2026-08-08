import { createFileRoute } from '@tanstack/react-router'
import { AnimatedIconsTablePage } from '#/components/animated-icons/animated-icons-table-page'

export const Route = createFileRoute('/animated-icons-table')({
  head: () => ({
    meta: [
      { title: 'Animated Icons Table — ShadTable' },
      {
        name: 'description',
        content:
          'Row actions built with Iconimate — motion-driven icons that animate on hover, focus, and click, wired to favorite, notify, archive, and delete.',
      },
      { property: 'og:title', content: 'Animated Icons Table — ShadTable' },
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
        },
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://shad-table.dev/animated-icons-table',
      },
    ],
  }),
  component: AnimatedIconsTablePage,
})
