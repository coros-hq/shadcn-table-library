import { createFileRoute } from '@tanstack/react-router'
import { MigrateV9Page } from '#/components/migration/migrate-v9-page'

export const Route = createFileRoute('/migrate-v9')({
  head: () => ({
    meta: [
      { title: 'Migrate TanStack Table v8 to v9 (shadcn/ui) — ShadTable' },
      {
        name: 'description',
        content:
          'Migrate shadcn/ui tables from TanStack Table v8 to v9: features, row models, types, sortFn, state and pinning, with before/after code.',
      },
      {
        property: 'og:title',
        content: 'Migrate TanStack Table v8 to v9 (shadcn/ui) — ShadTable',
      },
      {
        property: 'og:description',
        content:
          'Before and after code for every breaking change when moving shadcn/ui data tables to TanStack Table v9.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: 'Migrating from TanStack Table v8 to v9',
          description:
            'Before and after code for the breaking changes when moving shadcn/ui tables from TanStack Table v8 to v9.',
          proficiencyLevel: 'Intermediate',
        },
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://www.shad-table.dev/migrate-v9',
      },
    ],
  }),
  component: MigrateV9Page,
})
