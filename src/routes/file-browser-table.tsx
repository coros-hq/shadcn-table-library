import { createFileRoute } from '@tanstack/react-router'
import { FileBrowserTablePage } from '#/components/file-browser/file-browser-table-page'

export const Route = createFileRoute('/file-browser-table')({
  head: () => ({
    meta: [
      { title: 'Shadcn File Browser Table — ShadTable' },
      {
        name: 'description',
        content:
          'File browser table for shadcn/ui and TanStack Table: breadcrumb folder navigation, file selection with bulk actions, and expandable file details.',
      },
      {
        property: 'og:title',
        content: 'Shadcn File Browser Table — ShadTable',
      },
      {
        property: 'og:description',
        content:
          'Browse folders with breadcrumbs, select files to download or delete, and expand any file to see its size, dates, owner and tags.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'File Browser Table',
          description:
            'A file browser table with breadcrumb navigation, file selection and expandable metadata.',
          codeRepository: 'https://github.com/coros-hq/shadcn-table-library',
          programmingLanguage: 'TypeScript',
          url: 'https://www.shad-table.dev/file-browser-table',
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
        href: 'https://www.shad-table.dev/file-browser-table',
      },
    ],
  }),
  component: FileBrowserTablePage,
})
