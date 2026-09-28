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
      { title: 'Logs', to: '/logs-table' },
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

// Canonical (v8) paths that also have a ported /v9/<path> route. Every page
// is ported as of this writing. Deliberately a fixed list, not derived from
// navGroups above — a newly added v8-only page must be added here explicitly
// once its /v9 route exists, so the nav never links into a 404 in the meantime.
export const V9_PORTED_ROUTES = new Set<string>([
  '/data-table',
  '/server-table',
  '/server-filter',
  '/server-combined-table',
  '/toolbar-filter-table',
  '/filter-state-shape-table',
  '/filter-toolbar-table',
  '/params-filter-table',
  '/deployments-table',
  '/logs-table',
  '/tree-table',
  '/grouped-table',
  '/pivot-table',
  '/master-detail',
  '/tree-select',
  '/tree-reorder',
  '/reorder-table',
  '/editable-table',
  '/resizable-table',
  '/column-pinning-table',
  '/inventory-allocation-table',
  '/animated-icons-table',
  '/live-status-table',
  '/async-actions-table',
  '/kpi-table',
  '/comparison-table',
  '/heatmap-table',
  '/conditional-formatting-table',
  '/production-dashboard-table',
  '/utility-table',
  '/export-config-table',
  '/export-selected-table',
  '/mobile-cards-table',
])

export function NavContent({
  pathname,
  onNavigate,
  version = 'v8',
}: {
  pathname: string
  onNavigate?: () => void
  version?: 'v8' | 'v9'
}) {
  const prefix = (to: string) =>
    version === 'v9' && V9_PORTED_ROUTES.has(to) ? `/v9${to}` : to
  return (
    <SidebarProvider
      className="min-h-0 w-auto items-start"
      style={{ '--sidebar-width': '16rem' } as React.CSSProperties}
    >
      <Sidebar collapsible="none" className="bg-transparent">
        <SidebarContent className="overflow-x-hidden">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {topLevelLinks.map((link) => (
                  <SidebarMenuItem key={link.to}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === prefix(link.to)}
                      className="w-full rounded-md font-normal text-muted-foreground hover:bg-transparent hover:text-foreground data-[active=true]:bg-transparent data-[active=true]:font-normal data-[active=true]:text-foreground"
                    >
                      <Link to={prefix(link.to)} onClick={onNavigate}>
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
              defaultOpen={group.items.some((l) => prefix(l.to) === pathname)}
              className="group/collapsible"
            >
              <SidebarGroup className="py-0.5">
                <SidebarGroupLabel
                  asChild
                  className="flex w-full items-center rounded-md text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <CollapsibleTrigger>
                    {group.title}
                    <ChevronRight className="ml-auto size-3.5 text-muted-foreground/60 transition-transform duration-200 ease-out group-data-[state=open]/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                {/* forceMount keeps closed groups' links in the SSR HTML so
                    crawlers can discover every page; visibility (transitioned
                    alongside the row height) hides them from users and the
                    tab order while closed. */}
                <CollapsibleContent
                  forceMount
                  className="grid transition-[grid-template-rows,visibility] duration-200 ease-out data-[state=closed]:invisible data-[state=closed]:grid-rows-[0fr] data-[state=open]:grid-rows-[1fr] motion-reduce:transition-none"
                >
                  <SidebarGroupContent className="min-h-0 overflow-hidden">
                    <SidebarMenu className="mt-1 ml-3.5 w-auto gap-0.5 border-l border-sidebar-border pl-3">
                      {group.items.map((link) => {
                        const to = prefix(link.to)
                        const isActive = pathname === to
                        const unported =
                          version === 'v9' && !V9_PORTED_ROUTES.has(link.to)
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
                              <Link to={to} onClick={onNavigate}>
                                {link.title}
                                {unported ? (
                                  <span className="ml-auto text-[10px] text-muted-foreground/60">
                                    v8 only
                                  </span>
                                ) : null}
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
