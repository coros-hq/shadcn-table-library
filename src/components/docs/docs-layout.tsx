import type * as React from 'react'
import { useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { SiteHeader } from '#/components/docs/site-header.tsx'
import {
  NavContent,
  navGroups,
  topLevelLinks,
  V9_PORTED_ROUTES,
} from '#/components/docs/nav-content.tsx'
import { DocsPager } from '#/components/docs/docs-pager.tsx'
import {
  stripVersionPrefix,
  withVersionPrefix,
} from '#/components/docs/version-switcher.tsx'

const SITE_URL = 'https://www.shad-table.dev'

const allLinks = [
  ...topLevelLinks,
  ...navGroups.flatMap((group) => group.items),
]

// Home → page breadcrumb as JSON-LD; nav groups have no URL of their own, so
// they're left out rather than emitted as item-less crumbs.
function BreadcrumbJsonLd({ pathname }: { pathname: string }) {
  const link = allLinks.find((l) => l.to === stripVersionPrefix(pathname))
  if (!link) return null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'ShadTable',
        item: `${SITE_URL}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: link.title,
        item: `${SITE_URL}${link.to}`,
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

// Plain in-content link between the v8 and v9 twins of a page, so each is
// reachable from the other without the client-side version toggle.
function VersionTwinLink({ pathname }: { pathname: string }) {
  const isV9 = pathname === '/v9' || pathname.startsWith('/v9/')
  const base = stripVersionPrefix(pathname)
  if (!V9_PORTED_ROUTES.has(base)) return null
  const link = allLinks.find((l) => l.to === base)
  if (!link) return null

  return (
    <p className="text-sm text-muted-foreground">
      {isV9 ? 'Using TanStack Table v8? ' : 'Using TanStack Table v9? '}
      <Link
        to={withVersionPrefix(base, isV9 ? 'v8' : 'v9')}
        className="font-medium text-foreground underline underline-offset-4"
      >
        {isV9
          ? `See the v8 ${link.title}`
          : `See the v9 version of ${link.title}`}
      </Link>
      .
    </p>
  )
}

interface DocsLayoutProps {
  children: React.ReactNode
}

export function DocsLayout({ children }: DocsLayoutProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const version = pathname.startsWith('/v9') ? 'v9' : 'v8'

  return (
    <div className="min-h-svh">
      <BreadcrumbJsonLd pathname={pathname} />
      <SiteHeader
        mobileNavOpen={mobileNavOpen}
        onMobileNavOpenChange={setMobileNavOpen}
      />

      <div className="mx-auto max-w-6xl px-6 pt-12 pb-20">
        <div className="flex gap-16">
          <aside className="hidden shrink-0 md:block">
            <div className="sticky top-20 max-h-[calc(100svh-6rem)] overflow-x-hidden overflow-y-auto pr-2 pb-6">
              <NavContent pathname={pathname} version={version} />
            </div>
          </aside>

          <main className="min-w-0 flex-1 space-y-16">
            {children}
            <VersionTwinLink pathname={pathname} />
            <DocsPager pathname={pathname} />
          </main>
        </div>
      </div>
    </div>
  )
}
