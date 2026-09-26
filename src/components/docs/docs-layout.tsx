import type * as React from 'react'
import { useState } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { SiteHeader } from '#/components/docs/site-header.tsx'
import {
  NavContent,
  navGroups,
  topLevelLinks,
} from '#/components/docs/nav-content.tsx'
import { DocsPager } from '#/components/docs/docs-pager.tsx'

const SITE_URL = 'https://www.shad-table.dev'

const allLinks = [
  ...topLevelLinks,
  ...navGroups.flatMap((group) => group.items),
]

// Home → page breadcrumb as JSON-LD; nav groups have no URL of their own, so
// they're left out rather than emitted as item-less crumbs.
function BreadcrumbJsonLd({ pathname }: { pathname: string }) {
  const link = allLinks.find((l) => l.to === pathname)
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

interface DocsLayoutProps {
  children: React.ReactNode
}

export function DocsLayout({ children }: DocsLayoutProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

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
              <NavContent pathname={pathname} />
            </div>
          </aside>

          <main className="min-w-0 flex-1 space-y-16">
            {children}
            <DocsPager pathname={pathname} />
          </main>
        </div>
      </div>
    </div>
  )
}
