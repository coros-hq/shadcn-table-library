import { Link } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { cn } from '#/lib/utils.ts'
import {
  navGroups,
  topLevelLinks,
  V9_PORTED_ROUTES,
} from '#/components/docs/nav-content.tsx'
import type { NavLink } from '#/components/docs/nav-content.tsx'
import { stripVersionPrefix } from '#/components/docs/version-switcher.tsx'

const allLinks: NavLink[] = [
  ...topLevelLinks,
  ...navGroups.flatMap((group) => group.items),
]

const focusRing =
  'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50'

export function DocsPager({ pathname }: { pathname: string }) {
  // Links are keyed by their v8 path; v9 pages match on the stripped path and
  // keep the reader on v9 wherever a twin exists
  const isV9 = pathname === '/v9' || pathname.startsWith('/v9/')
  const base = stripVersionPrefix(pathname)
  const href = (to: string) =>
    isV9 && V9_PORTED_ROUTES.has(to) ? `/v9${to}` : to
  const index = allLinks.findIndex((link) => link.to === base)
  if (index === -1) return null

  const prev = index > 0 ? allLinks[index - 1] : undefined
  const next = index < allLinks.length - 1 ? allLinks[index + 1] : undefined
  const group = navGroups.find((g) => g.items.some((l) => l.to === base))
  const related = group?.items.filter(
    (l) => l.to !== base && l.to !== prev?.to && l.to !== next?.to,
  )

  return (
    <nav aria-label="More tables" className="space-y-6 border-t pt-8">
      {related && related.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            More in {group?.title}
          </p>
          <div className="flex flex-wrap gap-2">
            {related.map((link) => (
              <Link
                key={link.to}
                to={href(link.to)}
                className={cn(
                  'rounded-md border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground',
                  focusRing,
                )}
              >
                {link.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {prev ? (
          <PagerLink link={prev} to={href(prev.to)} direction="prev" />
        ) : (
          <span className="hidden sm:block" />
        )}
        {next && <PagerLink link={next} to={href(next.to)} direction="next" />}
      </div>
    </nav>
  )
}

function PagerLink({
  link,
  to,
  direction,
}: {
  link: NavLink
  to: string
  direction: 'prev' | 'next'
}) {
  const isNext = direction === 'next'
  return (
    <Link
      to={to}
      rel={direction}
      className={cn(
        'flex flex-col gap-1 rounded-lg border p-4 transition-colors hover:border-foreground/30',
        focusRing,
        isNext && 'items-end text-right',
      )}
    >
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        {!isNext && <ArrowLeft className="size-3.5" />}
        {isNext ? 'Next' : 'Previous'}
        {isNext && <ArrowRight className="size-3.5" />}
      </span>
      <span className="text-sm font-medium text-balance">{link.title}</span>
    </Link>
  )
}
