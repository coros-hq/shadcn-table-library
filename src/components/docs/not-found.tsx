import { Link } from '@tanstack/react-router'

import { Button } from '#/components/ui/button.tsx'

const popular = [
  { title: 'Data Table', to: '/data-table' },
  { title: 'Tree Table', to: '/tree-table' },
  { title: 'Infinite Scroll', to: '/infinite-scroll-table' },
  { title: 'Excel-like Table', to: '/spreadsheet-table' },
  { title: 'v8 → v9 Migration', to: '/migrate-v9' },
]

export function NotFound() {
  return (
    <main className="mx-auto flex min-h-svh max-w-xl flex-col items-start justify-center gap-6 px-6">
      {/* A missing page should never be indexed under the homepage's title */}
      <meta name="robots" content="noindex" />
      <p className="text-sm text-muted-foreground">404</p>
      <h1 className="text-4xl font-normal tracking-tight">Page not found</h1>
      <p className="text-muted-foreground">
        That page doesn&apos;t exist or has moved. Try one of the most popular
        examples, or browse all of them.
      </p>
      <ul className="flex flex-wrap gap-2">
        {popular.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className="rounded-md border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
            >
              {link.title}
            </Link>
          </li>
        ))}
      </ul>
      <Button asChild>
        <Link to="/">Back to ShadTable</Link>
      </Button>
    </main>
  )
}
