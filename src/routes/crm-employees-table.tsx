import { createFileRoute } from '@tanstack/react-router'
import { CrmEmployeesPage } from '#/components/crm-employees/crm-employees-page'
import type { CrmEmployeesExample } from '#/components/crm-employees/crm-employees-page'

export const Route = createFileRoute('/crm-employees-table')({
  validateSearch: (
    search: Record<string, unknown>,
  ): { example?: CrmEmployeesExample } => ({
    // Unknown keys survive validation, so an invalid value must be cleared
    // explicitly rather than left out
    example: search.example === 'multi-select' ? 'multi-select' : undefined,
  }),
  head: () => ({
    meta: [
      { title: 'Shadcn CRM Employees Table — ShadTable' },
      {
        name: 'description',
        content:
          'CRM employee table for shadcn/ui and TanStack Table with single or multi-select filters, search, sorting, row selection, density toggle and pagination.',
      },
      {
        property: 'og:title',
        content: 'Shadcn CRM Employees Table — ShadTable',
      },
      {
        property: 'og:description',
        content:
          'A dense employee directory built on shadcn/ui and TanStack Table: stacked cells, status badges, performance bars, salary formatting, filters and pagination.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'CRM Employees Table',
          description:
            'A data-dense CRM employee directory table with search, filters, sorting, row selection and pagination.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
          url: 'https://www.shad-table.dev/crm-employees-table',
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
        href: 'https://www.shad-table.dev/crm-employees-table',
      },
    ],
  }),
  component: CrmEmployeesPage,
})
