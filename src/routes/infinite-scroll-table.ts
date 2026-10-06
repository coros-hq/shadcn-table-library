import { createFileRoute } from '@tanstack/react-router'
import { InfiniteScrollPage } from '#/components/infinite-scroll/infinite-scroll-page'

export const Route = createFileRoute('/infinite-scroll-table')({
  head: () => ({
    meta: [
      { title: 'Shadcn Infinite Scroll Table — ShadTable' },
      {
        name: 'description',
        content:
          'An infinite scroll table for shadcn/ui and TanStack Table. Loads the next page as you scroll with an IntersectionObserver sentinel, skeleton loading rows, inline retry on errors, and a sticky header.',
      },
      {
        property: 'og:title',
        content: 'Shadcn Infinite Scroll Table — ShadTable',
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
        },
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://www.shad-table.dev/infinite-scroll-table',
      },
    ],
  }),
  component: InfiniteScrollPage,
})
