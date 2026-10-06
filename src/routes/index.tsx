import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

import { SiteHeader } from '#/components/docs/site-header.tsx'
import { AuroraBackground } from '#/components/docs/aurora-background.tsx'
import { HeroTable } from '#/components/docs/hero-table.tsx'
import { navGroups, topLevelLinks } from '#/components/docs/nav-content.tsx'
import type { NavLink } from '#/components/docs/nav-content.tsx'
import { Button } from '#/components/ui/button.tsx'
import GithubIcon from '#/../public/icons/github-logo.svg'

const faqs = [
  {
    question: 'What is ShadTable?',
    answer:
      'A collection of copy-paste table components built on shadcn/ui and TanStack Table. Each example is a shadcn registry item, so the code is copied into your project and you own it.',
  },
  {
    question: 'How do I install a component?',
    answer:
      'Run npx shadcn add https://www.shad-table.dev/r/tree-table.json, replacing tree-table with the example you want. The CLI copies the files into components/tables/ and installs the dependencies.',
  },
  {
    question: 'Does it support TanStack Table v9?',
    answer:
      'Yes. Every example has a v9 version, installed by adding -v9 to the name, and there is a step-by-step v8 to v9 migration guide.',
  },
  {
    question: 'Is there Vue support?',
    answer:
      'Each docs page has a Vue tab with the same example written for @tanstack/vue-table and shadcn-vue. The Vue code is source only for now; there are no Vue registry items yet.',
  },
  {
    question: 'Can I use these tables with server-side data?',
    answer:
      'Yes. There are server-side pagination, filtering, and sort examples that resolve each change on the server through the URL, built for TanStack Start, plus an infinite scroll table that loads pages from a cursor-based API.',
  },
]

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'ShadTable — Shadcn Data Table & Table Components' },
      {
        name: 'description',
        content:
          'Copy-paste table components for shadcn/ui and TanStack Table: data tables, server-side pagination, trees, pivots and editable grids. Own the code.',
      },
      {
        property: 'og:title',
        content: 'ShadTable — Shadcn Data Table & Table Components',
      },
      {
        property: 'og:description',
        content:
          'Copy-paste table components for shadcn/ui and TanStack Table — from sortable data tables to server-side pagination, tree/pivot structures, inline editing, and dashboard-analytics variants.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: { '@type': 'Answer', text: faq.answer },
          })),
        },
      },
    ],
    links: [{ rel: 'canonical', href: 'https://www.shad-table.dev/' }],
  }),
  component: Home,
})

interface Category {
  title: string
  links: NavLink[]
}

// Derived from the sidebar so every docs page is linked from the homepage.
const categories: Category[] = [
  {
    title: 'Data Table',
    links: topLevelLinks.filter((link) => link.to !== '/migrate-v9'),
  },
  ...navGroups.map((group) => ({ title: group.title, links: group.items })),
]

// Guides are not tables, so they stay out of the count
const tableCount = categories.reduce((n, c) => n + c.links.length, 0)

function Home() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    // overflow-clip rather than overflow-hidden so the sticky header still sticks
    <div className="relative isolate flex min-h-svh flex-col overflow-clip">
      <AuroraBackground />
      <SiteHeader
        mobileNavOpen={mobileNavOpen}
        onMobileNavOpenChange={setMobileNavOpen}
        transparent
      />

      <main className="flex flex-1">
        <section className="relative flex flex-1 items-center">
          <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
            <div>
              <h1 className="mt-5 text-4xl font-normal tracking-tight text-balance sm:text-5xl">
                Table components for the parts of your app that a design system
                doesn&apos;t cover.
              </h1>
              <p className="mt-6 max-w-xl text-lg font-normal text-muted-foreground text-balance">
                {tableCount} copy-paste tables, from server-side pagination to
                pivots, trees, and inline editing.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link to="/data-table">
                    Browse components
                    <ArrowRight className="size-4" />
                  </Link>
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
              </div>
            </div>

            <div className="min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-700 fill-mode-both">
              <HeroTable />
            </div>
          </div>
        </section>
      </main>

      <div className="relative mx-auto w-full max-w-6xl space-y-20 px-6 pt-8 pb-24">
        <section aria-labelledby="catalogue">
          <h2
            id="catalogue"
            className="text-2xl font-normal tracking-tight sm:text-3xl"
          >
            Every table, by what it does
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Each example has a live demo, the full source, an install command,
            and a step-by-step walkthrough of how it works.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <div
                key={category.title}
                className="rounded-xl border bg-background/60 p-5 backdrop-blur-sm"
              >
                <h3 className="text-base font-medium">{category.title}</h3>
                <ul className="mt-3 space-y-1.5">
                  {category.links.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="versions"
          className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
        >
          <div>
            <h2
              id="versions"
              className="text-2xl font-normal tracking-tight sm:text-3xl"
            >
              TanStack Table v8 and v9
            </h2>
            <p className="mt-3 text-muted-foreground">
              Every example is available for both major versions of TanStack
              Table, so you can start on v9 or move an existing table over.
            </p>
          </div>
          <div className="flex flex-wrap content-start gap-3">
            <Button asChild variant="outline">
              <Link to="/data-table">v8 examples</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/v9/data-table">v9 examples</Link>
            </Button>
            <Button asChild>
              <Link to="/migrate-v9">
                v8 → v9 migration guide
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section aria-labelledby="faq">
          <h2
            id="faq"
            className="text-2xl font-normal tracking-tight sm:text-3xl"
          >
            Frequently asked questions
          </h2>
          <dl className="mt-8 grid gap-x-12 gap-y-8 md:grid-cols-2">
            {faqs.map((faq) => (
              <div key={faq.question}>
                <dt className="font-medium">{faq.question}</dt>
                <dd className="mt-2 text-sm text-muted-foreground">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  )
}
