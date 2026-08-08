import type * as React from 'react'
import { useState } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { SiteHeader } from '#/components/docs/site-header.tsx'
import { NavContent } from '#/components/docs/nav-content.tsx'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '#/components/ui/sheet.tsx'

interface DocsLayoutProps {
  children: React.ReactNode
}

export function DocsLayout({ children }: DocsLayoutProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="min-h-svh">
      <SiteHeader
        mobileNavOpen={mobileNavOpen}
        onMobileNavOpenChange={setMobileNavOpen}
      />

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-72 overflow-y-auto p-4">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <NavContent
            pathname={pathname}
            onNavigate={() => setMobileNavOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-10 max-w-2xl">
          <div className="flex items-center gap-3 text-3xl font-bold tracking-tight">
            <img src="/logo.svg" alt="" className="size-9 rounded-lg" />
            ShadTable
          </div>
          <p className="mt-2 text-muted-foreground">
            A collection of composable table components built on shadcn/ui and
            TanStack Table.
          </p>
        </div>

        <div className="flex gap-12">
          <aside className="hidden shrink-0 md:block">
            <div className="sticky top-20 max-h-[calc(100svh-6rem)] overflow-y-auto pr-2 pb-6">
              <NavContent pathname={pathname} />
            </div>
          </aside>

          <main className="min-w-0 flex-1 space-y-16">{children}</main>
        </div>
      </div>
    </div>
  )
}
