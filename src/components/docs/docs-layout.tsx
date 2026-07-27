import type * as React from 'react'
import { useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { ChevronRight, Menu } from 'lucide-react'
import DiscordIcon from '#/../public/icons/discord-logo.svg'
import  GithubIcon from '#/../public/icons/github-logo.svg'
import { ThemeToggle } from '#/components/docs/theme-toggle.tsx'
import { cn } from '#/lib/utils.ts'
import { Button } from '#/components/ui/button.tsx'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '#/components/ui/collapsible.tsx'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '#/components/ui/sheet.tsx'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '#/components/ui/sidebar.tsx'

interface NavLink {
  title: string
  to: string
}

interface NavGroup {
  title: string
  items: NavLink[]
}

const topLevelLinks: NavLink[] = [{ title: 'Data Table', to: '/' }]

const navGroups: NavGroup[] = [
  {
    title: 'SSR',
    items: [
      { title: 'Pagination', to: '/server-table' },
      { title: 'Filter', to: '/server-filter' },
    ],
  },
  {
    title: 'Structure / Hierarchy',
    items: [
      { title: 'Tree Table', to: '/tree-table' },
      { title: 'Grouped Table', to: '/grouped-table' },
      { title: 'Pivot Table', to: '/pivot-table' },
      { title: 'Master-Detail Table', to: '/master-detail' },
    ],
  },
  {
    title: 'Interaction-heavy',
    items: [
      { title: 'Tree Table — Selection', to: '/tree-select' },
      { title: 'Tree Table — Reorder', to: '/tree-reorder' },
      { title: 'Reorderable Table', to: '/reorder-table' },
      { title: 'Editable Table', to: '/editable-table' },
      { title: 'Resizable / Reorderable Columns', to: '/resizable-table' },
    ],
  },
  {
    title: 'Dashboard / Analytics-specific',
    items: [
      { title: 'Summary / KPI Table', to: '/kpi-table' },
      { title: 'Comparison Table', to: '/comparison-table' },
      { title: 'Heatmap Table', to: '/heatmap-table' },
    ],
  },
  {
    title: 'Export / Density Variants',
    items: [{ title: 'Density & Export', to: '/utility-table' }],
  },
]

function NavContent({
  pathname,
  onNavigate,
}: {
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <SidebarProvider
      className="min-h-0 w-auto items-start"
      style={{ '--sidebar-width': '16rem' } as React.CSSProperties}
    >
      <Sidebar collapsible="none" className="bg-transparent">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {topLevelLinks.map((link) => (
                  <SidebarMenuItem key={link.to}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === link.to}
                      className="w-full rounded-lg font-medium data-[active=true]:shadow-sm"
                    >
                      <Link to={link.to} onClick={onNavigate}>
                        {link.title}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {navGroups.map((group) => (
            <Collapsible
              key={group.title}
              defaultOpen
              className="group/collapsible"
            >
              <SidebarGroup>
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger className="flex w-full items-center rounded-md text-[11px] font-semibold tracking-wider text-muted-foreground/80 uppercase hover:text-foreground">
                    {group.title}
                    <ChevronRight className="ml-auto size-3.5 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu className="mt-1 ml-3.5 gap-0.5 border-l border-sidebar-border pl-3">
                      {group.items.map((link) => {
                        const isActive = pathname === link.to
                        return (
                          <SidebarMenuItem key={link.to}>
                            <SidebarMenuButton
                              asChild
                              isActive={isActive}
                              className={cn(
                                'relative w-full rounded-md before:absolute before:top-1/2 before:-left-[13px] before:h-4 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-transparent before:transition-colors before:content-[""]',
                                isActive && 'before:bg-primary',
                              )}
                            >
                              <Link to={link.to} onClick={onNavigate}>
                                {link.title}
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        )
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          ))}
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
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
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mr-1 md:hidden"
              aria-label="Open navigation"
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu className="size-5" />
            </Button>
            <span className="flex items-center gap-2">
              <img src="/logo.svg" alt="" className="size-6 rounded-md" />
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-sm font-semibold tracking-tight text-transparent">
                ShadTable
              </span>
            </span>
          </div>
          <div className="flex flex-row items-center gap-3">
            <ThemeToggle />
            <a
              href="https://discord.gg/4J6MVnnRY"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Join Discord"
            >
              <img src={DiscordIcon} alt="Discord" className="size-5 dark:invert" />
            </a>
            <a
              href="https://github.com/coros-hq/shadcn-table-library"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub Repository"
            >
              <img src={GithubIcon} alt="GitHub" className="size-5 dark:invert" />
            </a>
          </div>
        </div>
      </header>

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
            A collection of composable table components built on shadcn/ui
            and TanStack Table.
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
