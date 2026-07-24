import type * as React from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'

import { ThemeToggle } from '#/components/docs/theme-toggle.tsx'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '#/components/ui/collapsible.tsx'
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
]

interface DocsLayoutProps {
  children: React.ReactNode
}

export function DocsLayout({ children }: DocsLayoutProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <span className="text-sm font-semibold tracking-tight">
            ShadCn Table Library
          </span>
          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-10 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight">
            ShadCn Table Library
          </h1>
          <p className="mt-2 text-muted-foreground">
            A collection of composable table components built on shadcn/ui
            and TanStack Table.
          </p>
        </div>

        <div className="flex gap-10">
          <aside className="hidden shrink-0 md:block">
            <div className="sticky top-24">
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
                                className="w-full"
                              >
                                <Link to={link.to}>{link.title}</Link>
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
                            <CollapsibleTrigger className="flex w-full items-center">
                              {group.title}
                              <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                            </CollapsibleTrigger>
                          </SidebarGroupLabel>
                          <CollapsibleContent>
                            <SidebarGroupContent>
                              <SidebarMenu>
                                {group.items.map((link) => (
                                  <SidebarMenuItem
                                    key={link.to}
                                    className="ml-3"
                                  >
                                    <SidebarMenuButton
                                      asChild
                                      isActive={pathname === link.to}
                                      className="w-full"
                                    >
                                      <Link to={link.to}>{link.title}</Link>
                                    </SidebarMenuButton>
                                  </SidebarMenuItem>
                                ))}
                              </SidebarMenu>
                            </SidebarGroupContent>
                          </CollapsibleContent>
                        </SidebarGroup>
                      </Collapsible>
                    ))}
                  </SidebarContent>
                </Sidebar>
              </SidebarProvider>
            </div>
          </aside>

          <main className="min-w-0 flex-1 space-y-16">{children}</main>
        </div>
      </div>
    </div>
  )
}
