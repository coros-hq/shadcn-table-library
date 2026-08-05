import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, ArrowUpRight } from 'lucide-react'

import { BasicTableUsage } from '#/components/basic'
import { SiteHeader } from '#/components/docs/site-header.tsx'
import { InstallCommand } from '#/components/docs/copy-install-command.tsx'
import { CodeBlock } from '#/components/docs/code-block.tsx'
import { Button } from '#/components/ui/button.tsx'
import DiscordIcon from '#/../public/icons/discord-logo.svg'
import GithubIcon from '#/../public/icons/github-logo.svg'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'ShadTable — Composable table components for shadcn/ui' },
      {
        name: 'description',
        content:
          'A collection of composable table components for shadcn/ui and TanStack Table — data tables, server-side pagination, tree tables, pivot tables, editable grids, and more. Installed via the shadcn CLI, owned in your codebase.',
      },
      {
        property: 'og:title',
        content: 'ShadTable — Composable table components for shadcn/ui',
      },
      {
        property: 'og:description',
        content:
          'Copy-paste table components for shadcn/ui and TanStack Table — from sortable data tables to server-side pagination, tree/pivot structures, inline editing, and dashboard-analytics variants.',
      },
    ],
    links: [{ rel: 'canonical', href: 'https://shad-table.dev/' }],
  }),
  component: Home,
})

interface CategoryLink {
  title: string
  to: string
}

interface Category {
  title: string
  description: string
  links: CategoryLink[]
}

const categories: Category[] = [
  {
    title: 'Data Table',
    description:
      'The base primitive — client-side sorting, filtering, and pagination over an in-memory dataset. Everything else builds on this pattern.',
    links: [{ title: 'Data Table', to: '/data-table' }],
  },
  {
    title: 'SSR',
    description:
      'For datasets too large to ship to the client — pagination and filtering trigger real server requests instead of slicing an array in the browser.',
    links: [
      { title: 'Pagination', to: '/server-table' },
      { title: 'Filter', to: '/server-filter' },
    ],
  },
  {
    title: 'Structure / Hierarchy',
    description:
      'Nested and dimensional data — trees, grouped rows, pivoted aggregates, and parent/child record pairs.',
    links: [
      { title: 'Tree Table', to: '/tree-table' },
      { title: 'Grouped Table', to: '/grouped-table' },
      { title: 'Pivot Table', to: '/pivot-table' },
      { title: 'Master-Detail Table', to: '/master-detail' },
    ],
  },
  {
    title: 'Interaction-heavy',
    description:
      'Tables where the user reshapes the data directly — selecting tree nodes, reordering rows, editing cells in place, resizing columns.',
    links: [
      { title: 'Tree Table — Selection', to: '/tree-select' },
      { title: 'Reorderable Table', to: '/reorder-table' },
      { title: 'Editable Table', to: '/editable-table' },
      { title: 'Resizable / Reorderable Columns', to: '/resizable-table' },
    ],
  },
  {
    title: 'Dashboard / Analytics-specific',
    description:
      'Summary rows, side-by-side comparisons, and heatmap cells for dashboards where the table is the analysis surface, not just a record list.',
    links: [
      { title: 'Summary / KPI Table', to: '/kpi-table' },
      { title: 'Comparison Table', to: '/comparison-table' },
      { title: 'Heatmap Table', to: '/heatmap-table' },
    ],
  },
  {
    title: 'Export / Density Variants',
    description:
      'Utilities that sit on top of any table — compact/comfortable row density and CSV export, wired through the same column API.',
    links: [{ title: 'Density & Export', to: '/utility-table' }],
  },
]

const differentiators = [
  {
    title: 'You own the code',
    description:
      'Installed via the shadcn CLI as source files in your repo, not a package in node_modules. No version to bump, no black box to eject from when a table needs to do something the library didn’t anticipate.',
  },
  {
    title: 'Built on TanStack Table’s headless core',
    description:
      'Sorting, filtering, pagination, and row models come from a battle-tested, framework-agnostic engine. ShadTable supplies the shadcn/ui rendering layer on top — it doesn’t reinvent table state management.',
  },
  {
    title: 'Composable primitives, not a monolith',
    description:
      'Each table type is its own small set of components. Need a tree table with custom row actions? Extend the tree components directly instead of threading fifteen props through one do-everything <DataTable>.',
  },
  {
    title: 'Real filtering, not fixed dropdowns',
    description:
      'Filters read and write the TanStack column API directly — column.getFilterValue() / setFilterValue() — so you can wire up range filters, multi-select, or server-driven facets. It’s not a hardcoded Select bolted onto a header.',
  },
]

const usageSnippet = `import { DataTable } from '@/components/basic/data-table'
import { columns } from '@/components/basic/columns'

export function UsersTable({ data }: { data: User[] }) {
  return <DataTable columns={columns} data={data} />
}`

function Home() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="min-h-svh">
      <SiteHeader
        mobileNavOpen={mobileNavOpen}
        onMobileNavOpenChange={setMobileNavOpen}
      />

      <main>
        {/* Hero */}
        <section className="border-b">
          <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
            <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both">
              <p className="font-mono text-xs text-muted-foreground">
                shadcn/ui + TanStack Table
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                Table components for the parts of your app that a design system
                doesn&apos;t cover.
              </h1>
              <p className="mt-4 text-base text-muted-foreground text-balance">
                ShadTable is a set of composable, copy-paste table
                components&nbsp;&mdash; sortable data tables, server-side
                pagination, tree and pivot structures, inline editing,
                dashboard/analytics variants&nbsp;&mdash; for engineers building
                data-dense UIs on shadcn/ui and TanStack Table.
              </p>

              <div className="mt-6 max-w-xl">
                <InstallCommand name="data-table" />
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <a href="/data-table">
                    Browse components
                    <ArrowRight className="size-4" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a
                    href="https://github.com/coros-hq/shadcn-table-library"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={GithubIcon}
                      alt=""
                      className="size-4 dark:invert"
                    />
                    GitHub
                  </a>
                </Button>
                <Button asChild variant="ghost" size="lg">
                  <a
                    href="https://discord.gg/4J6MVnnRY"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={DiscordIcon}
                      alt=""
                      className="size-4 dark:invert"
                    />
                    Discord
                  </a>
                </Button>
              </div>
            </div>

            {/* Live table preview */}
            <div className="mt-12 animate-in fade-in slide-in-from-bottom-2 duration-700 fill-mode-both">
              <div className="rounded-xl border bg-card p-4 shadow-sm sm:p-6">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-mono text-xs text-muted-foreground">
                    src/components/basic/index.tsx
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    live
                  </p>
                </div>
                <BasicTableUsage />
              </div>
            </div>
          </div>
        </section>

        {/* Category overview */}
        <section id="components" className="border-b scroll-mt-14">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold tracking-tight">
                Components
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Organized the same way as the docs sidebar &mdash; pick the
                category that matches the shape of your data, not a generic
                feature list.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <div
                  key={category.title}
                  className="flex flex-col rounded-xl border bg-card p-5"
                >
                  <h3 className="text-sm font-semibold">{category.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {category.description}
                  </p>
                  <ul className="mt-4 flex flex-1 flex-col gap-1.5 border-t pt-4">
                    {category.links.map((link) => (
                      <li key={link.to}>
                        <Link
                          to={link.to}
                          className="inline-flex items-center gap-1 rounded-sm text-sm text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        >
                          {link.title}
                          <ArrowUpRight className="size-3 text-muted-foreground" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why ShadTable */}
        <section className="border-b">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="text-2xl font-semibold tracking-tight">
              Why ShadTable
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2">
              {differentiators.map((item, i) => (
                <div key={item.title} className="flex gap-4">
                  <span className="font-mono text-sm text-muted-foreground">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold">{item.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quickstart */}
        <section className="border-b">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold tracking-tight">Install</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Run the CLI command inside a project that already has shadcn/ui
                set up. It adds the table component and its dependencies as
                source files under your components directory.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
              <InstallCommand name="data-table" />
              <CodeBlock
                filename="app/users/users-table.tsx"
                code={usageSnippet}
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="" className="size-6 rounded-md" />
              <span className="text-sm font-semibold tracking-tight">
                ShadTable
              </span>
            </div>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Composable table components for shadcn/ui and TanStack Table.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://github.com/coros-hq/shadcn-table-library"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub Repository"
              >
                <img
                  src={GithubIcon}
                  alt="GitHub"
                  className="size-5 dark:invert"
                />
              </a>
              <a
                href="https://discord.gg/4J6MVnnRY"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Join Discord"
              >
                <img
                  src={DiscordIcon}
                  alt="Discord"
                  className="size-5 dark:invert"
                />
              </a>
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3">
            {categories.map((category) => (
              <div key={category.title}>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {category.title}
                </p>
                <ul className="mt-2.5 space-y-2">
                  {category.links.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className="rounded-sm text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      >
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <p className="mt-10 border-t pt-6 text-xs text-muted-foreground">
          Built on shadcn/ui and TanStack Table.
        </p>
      </footer>
    </div>
  )
}
