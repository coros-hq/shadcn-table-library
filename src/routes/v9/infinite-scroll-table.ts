import { createFileRoute } from '@tanstack/react-router'
import { InfiniteScrollPage } from '#/components/v9/infinite-scroll/infinite-scroll-page'

export const Route = createFileRoute('/v9/infinite-scroll-table')({
  head: () => ({
    meta: [
      { title: 'Shadcn Infinite Scroll Table — TanStack Table v9 — ShadTable' },
      {
        name: 'description',
        content:
          'Infinite scroll table for shadcn/ui and TanStack Table: IntersectionObserver loading, skeleton rows, retry on error, sticky header. For TanStack Table v9.',
      },
      {
        property: 'og:title',
        content: 'Shadcn Infinite Scroll Table — TanStack Table v9 — ShadTable',
      },
      {
        property: 'og:description',
        content:
          'Cursor-based infinite scrolling for shadcn/ui tables with loading skeletons, error retry, and a sticky header.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'Infinite Scroll Table',
          description:
            'A table that loads more rows as you scroll, using an IntersectionObserver sentinel and a cursor-based fetcher.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
          url: 'https://www.shad-table.dev/v9/infinite-scroll-table',
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
        href: 'https://www.shad-table.dev/v9/infinite-scroll-table',
      },
    ],
  }),
  component: InfiniteScrollPage,
})
