import { Link } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { cn } from '#/lib/utils.ts'
import { navGroups, topLevelLinks } from '#/components/docs/nav-content.tsx'
import type { NavLink } from '#/components/docs/nav-content.tsx'

const allLinks: NavLink[] = [
  ...topLevelLinks,
  ...navGroups.flatMap((group) => group.items),
]

export function DocsPager({ pathname }: { pathname: string }) {
  const index = allLinks.findIndex((link) => link.to === pathname)
  if (index === -1) return null

  const prev = index > 0 ? allLinks[index - 1] : undefined
  const next = index < allLinks.length - 1 ? allLinks[index + 1] : undefined
  const group = navGroups.find((g) => g.items.some((l) => l.to === pathname))
  const related = group?.items.filter(
    (l) => l.to !== pathname && l.to !== prev?.to && l.to !== next?.to,
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
                to={link.to}
                className="rounded-md border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                {link.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {prev ? (
          <PagerLink link={prev} direction="prev" />
        ) : (
          <span className="hidden sm:block" />
        )}
        {next && <PagerLink link={next} direction="next" />}
      </div>
    </nav>
  )
}

function PagerLink({
  link,
  direction,
}: {
  link: NavLink
  direction: 'prev' | 'next'
}) {
  const isNext = direction === 'next'
  return (
    <Link
      to={link.to}
      rel={direction}
      className={cn(
        'flex flex-col gap-1 rounded-lg border p-4 transition-colors hover:border-foreground/30',
        isNext && 'items-end text-right',
      )}
    >
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        {!isNext && <ArrowLeft className="size-3.5" />}
        {isNext ? 'Next' : 'Previous'}
        {isNext && <ArrowRight className="size-3.5" />}
      </span>
      <span className="text-sm font-medium">{link.title}</span>
    </Link>
  )
}
