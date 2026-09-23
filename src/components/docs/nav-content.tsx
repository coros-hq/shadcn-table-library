import type * as React from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { cn } from '#/lib/utils.ts'
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

export interface NavLink {
  title: string
  to: string
}

export interface NavGroup {
  title: string
  items: NavLink[]
}

export const topLevelLinks: NavLink[] = [
  { title: 'Data Table', to: '/data-table' },
]

export const navGroups: NavGroup[] = [
  {
    title: 'SSR',
    items: [
      { title: 'Pagination', to: '/server-table' },
      { title: 'Filter', to: '/server-filter' },
      { title: 'Sort + Filter + Pagination', to: '/server-combined-table' },
    ],
  },
  {
    title: 'Advanced Filters',
    items: [
      { title: 'Toolbar Filter Table', to: '/toolbar-filter-table' },
      { title: 'Filter State Shape', to: '/filter-state-shape-table' },
      { title: 'Filter Toolbar', to: '/filter-toolbar-table' },
      { title: 'Params Filter Table', to: '/params-filter-table' },
      { title: 'Deployments', to: '/deployments-table' },
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
      { title: 'Column Pinning', to: '/column-pinning-table' },
      { title: 'Inventory Allocation', to: '/inventory-allocation-table' },
    ],
  },
  {
    title: 'Animated',
    items: [
      { title: 'Animated Icons Table', to: '/animated-icons-table' },
      { title: 'Live Status Indicators', to: '/live-status-table' },
      { title: 'Async Row Actions', to: '/async-actions-table' },
    ],
  },
  {
    title: 'Dashboard / Analytics-specific',
    items: [
      { title: 'Summary / KPI Table', to: '/kpi-table' },
      { title: 'Comparison Table', to: '/comparison-table' },
      { title: 'Heatmap Table', to: '/heatmap-table' },
      { title: 'Conditional Formatting', to: '/conditional-formatting-table' },
      { title: 'Production Dashboard', to: '/production-dashboard-table' },
    ],
  },
  {
    title: 'Export / Density Variants',
    items: [
      { title: 'Density & Export', to: '/utility-table' },
      { title: 'Export Configuration', to: '/export-config-table' },
      { title: 'Export Selected Rows', to: '/export-selected-table' },
    ],
  },
  {
    title: 'Responsive',
    items: [{ title: 'Mobile Cards Table', to: '/mobile-cards-table' }],
  },
]

export function NavContent({
  pathname,
  onNavigate,
}: {
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <SidebarProvider
      className="min-h-0 w-auto items-start"
      style={{ '--sidebar-width': '15rem' } as React.CSSProperties}
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
                      className="w-full rounded-md font-normal text-muted-foreground hover:bg-transparent hover:text-foreground data-[active=true]:bg-transparent data-[active=true]:font-normal data-[active=true]:text-foreground"
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
              defaultOpen={group.items.some((l) => l.to === pathname)}
              className="group/collapsible"
            >
              <SidebarGroup className="py-0.5">
                <SidebarGroupLabel
                  asChild
                  className="flex w-full items-center rounded-md text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <CollapsibleTrigger>
                    {group.title}
                    <ChevronRight className="ml-auto size-3.5 text-muted-foreground/60 transition-transform group-data-[state=open]/collapsible:rotate-90" />
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
                                'relative w-full rounded-md font-normal text-muted-foreground hover:bg-transparent hover:text-foreground data-[active=true]:bg-transparent data-[active=true]:font-normal data-[active=true]:text-foreground before:absolute before:top-1/2 before:-left-[13px] before:h-4 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-transparent before:transition-colors before:content-[""]',
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
