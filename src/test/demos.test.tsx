import { createElement } from 'react'
import type { ComponentType } from 'react'
import { render } from '@testing-library/react'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Every example's demo component, React v8 and v9, found by convention:
// src/components/<example>/index.tsx exporting a `*Demo` / `*Usage` component.
const loaders = import.meta.glob<Record<string, unknown>>(
  [
    '/src/components/**/index.tsx',
    '!/src/components/vue/**',
    '!/src/components/ui/**',
  ],
  { eager: false },
)

// These read their state from the live TanStack Router route (loader data and
// search params), so they only render inside the real route tree. The
// production build prerenders those routes, which covers them.
const NEEDS_ROUTER = ['/ssr/']

const entries = Object.entries(loaders).filter(
  ([path]) => !NEEDS_ROUTER.some((fragment) => path.includes(fragment)),
)

describe('example demos render', () => {
  let errors: unknown[][]

  beforeEach(() => {
    errors = []
    vi.spyOn(console, 'error').mockImplementation((...args) => {
      errors.push(args)
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('finds the demos', () => {
    expect(entries.length).toBeGreaterThan(40)
  })

  it.each(entries)('%s', async (path, load) => {
    const module = await load()
    const demos = Object.entries(module).filter(
      ([name, value]) =>
        /(Demo|Usage)$/.test(name) && typeof value === 'function',
    )
    expect(demos.length, `${path} exports no *Demo component`).toBeGreaterThan(
      0,
    )

    for (const [name, Demo] of demos) {
      const { container, unmount } = render(
        createElement(
          NuqsTestingAdapter,
          null,
          createElement(Demo as ComponentType),
        ),
      )
      expect(
        container.innerHTML.length,
        `${name} rendered nothing`,
      ).toBeGreaterThan(0)
      expect(
        container.querySelector('table, [role="table"], [role="grid"]'),
        `${name} rendered no table`,
      ).not.toBeNull()
      unmount()
    }

    // React reports key warnings, invalid DOM nesting and hook misuse here
    expect(errors, `console.error during ${path}`).toEqual([])
  })
})
