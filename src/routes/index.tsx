import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

import { SiteHeader } from '#/components/docs/site-header.tsx'
import { AuroraBackground } from '#/components/docs/aurora-background.tsx'
import { HeroTable } from '#/components/docs/hero-table.tsx'
import {
  navGroups,
  topLevelLinks,
  V9_PORTED_ROUTES,
} from '#/components/docs/nav-content.tsx'
import type { NavLink } from '#/components/docs/nav-content.tsx'
import { withVersionPrefix } from '#/components/docs/version-switcher.tsx'
import { Button } from '#/components/ui/button.tsx'
import GithubIcon from '#/../public/icons/github-logo.svg'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'ShadTable — Shadcn Data Table & Table Components' },
      {
        name: 'description',
        content:
          'Copy-paste table components for shadcn/ui and TanStack Table: data tables, server-side pagination, trees, pivots and editable grids. Own the code.',
      },
      {
        property: 'og:title',
        content: 'ShadTable — Shadcn Data Table & Table Components',
      },
      {
        property: 'og:description',
        content:
          'Copy-paste table components for shadcn/ui and TanStack Table — from sortable data tables to server-side pagination, tree/pivot structures, inline editing, and dashboard-analytics variants.',
      },
    ],
    links: [{ rel: 'canonical', href: 'https://www.shad-table.dev/' }],
  }),
  component: Home,
})

interface Category {
  title: string
  links: NavLink[]
}

// Derived from the sidebar so every docs page is linked from the homepage.
const categories: Category[] = [
  {
    title: 'Data Table',
    links: topLevelLinks.filter((link) => link.to !== '/migrate-v9'),
  },
  ...navGroups.map((group) => ({ title: group.title, links: group.items })),
]

// Guides are not tables, so they stay out of the count
const tableCount = categories.reduce((n, c) => n + c.links.length, 0)

function Home() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    // overflow-clip rather than overflow-hidden so the sticky header still sticks
    <div className="relative isolate flex min-h-svh flex-col overflow-clip">
      <AuroraBackground />
      <SiteHeader
        mobileNavOpen={mobileNavOpen}
        onMobileNavOpenChange={setMobileNavOpen}
        transparent
      />

      <main className="flex flex-1">
        <section className="relative flex flex-1 items-center">
          <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
            <div>
              <h1 className="mt-5 text-4xl font-normal tracking-tight text-balance sm:text-5xl">
                Table components for the parts of your app that a design system
                doesn&apos;t cover.
              </h1>
              <p className="mt-6 max-w-xl text-lg font-normal text-muted-foreground text-balance">
                {tableCount} copy-paste tables, from server-side pagination to
                pivots, trees, and inline editing.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link to="/data-table">
                    Browse components
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a
                    href="https://github.com/coros-hq/shadcn-table-library"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={GithubIcon}
                      alt=""
                      className="size-4 dark:invert"
                    />
                    GitHub
                  </a>
                </Button>
              </div>
            </div>

            <div className="min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-700 fill-mode-both">
              <HeroTable />
            </div>
          </div>
        </section>
      </main>

      <section
        aria-labelledby="all-tables"
        className="relative mx-auto w-full max-w-6xl px-6 pb-24"
      >
        <h2 id="all-tables" className="text-2xl font-normal tracking-tight">
          All table components
        </h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div key={category.title}>
              <h3 className="text-sm font-medium">{category.title}</h3>
              <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                {category.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="hover:text-foreground">
                      {link.title}
                    </Link>
                    {V9_PORTED_ROUTES.has(link.to) && (
                      <>
                        {' · '}
                        <Link
                          to={withVersionPrefix(link.to, 'v9')}
                          className="hover:text-foreground"
                        >
                          v9
                        </Link>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-10 text-sm text-muted-foreground">
          Moving to TanStack Table v9? Read the{' '}
          <Link
            to="/migrate-v9"
            className="font-medium text-foreground underline underline-offset-4"
          >
            v8 → v9 migration guide
          </Link>
          .
        </p>
      </section>
    </div>
  )
}
