import { Link, useRouterState } from '@tanstack/react-router'
import { cn } from '#/lib/utils.ts'
import { V9_PORTED_ROUTES } from '#/components/docs/nav-content.tsx'

export function stripVersionPrefix(pathname: string): string {
  if (pathname === '/v9' || pathname.startsWith('/v9/')) {
    const rest = pathname.slice('/v9'.length)
    return rest === '' ? '/' : rest
  }
  return pathname
}

export function withVersionPrefix(pathname: string, version: 'v8' | 'v9') {
  if (version === 'v8') return pathname
  if (pathname !== '/' && !V9_PORTED_ROUTES.has(pathname)) return '/v9'
  return pathname === '/' ? '/v9' : `/v9${pathname}`
}

export function VersionSwitcher() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isV9 = pathname === '/v9' || pathname.startsWith('/v9/')
  const basePath = stripVersionPrefix(pathname)

  const versions: Array<{ label: string; version: 'v8' | 'v9' }> = [
    { label: 'v8', version: 'v8' },
    { label: 'v9', version: 'v9' },
  ]

  return (
    <div className="flex items-center rounded-md border p-0.5 text-xs">
      {versions.map(({ label, version }) => {
        const active = isV9 ? version === 'v9' : version === 'v8'
        return (
          <Link
            key={version}
            to={withVersionPrefix(basePath, version)}
            className={cn(
              'rounded-sm px-2 py-1 font-medium transition-colors',
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
            aria-current={active ? 'page' : undefined}
          >
            {label}
          </Link>
        )
      })}
    </div>
  )
}
