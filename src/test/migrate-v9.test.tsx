import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { MigrateV9Page } from '#/components/migration/migrate-v9-page.tsx'

// The page ships inside the docs shell, which needs the app router
vi.mock('#/components/docs/docs-layout.tsx', () => ({
  DocsLayout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: ReactNode }) => <a>{children}</a>,
}))

// Radix tabs activate on mousedown, not click
const choose = (name: string) =>
  fireEvent.mouseDown(screen.getByRole('tab', { name }), { button: 0 })

describe('MigrateV9Page framework toggle', () => {
  beforeEach(() => localStorage.clear())

  it('starts with the React migration and install command', () => {
    render(<MigrateV9Page />)
    expect(document.body.textContent).toContain('useReactTable')
    expect(document.body.textContent).toContain(
      'npx shadcn add https://www.shad-table.dev/r/data-table-v9.json',
    )
  })

  it('switches the snippets, reference and checklist to Svelte', () => {
    render(<MigrateV9Page />)
    choose('Svelte')

    expect(document.body.textContent).toContain('createSvelteTable')
    expect(document.body.textContent).toContain(
      'npm i @tanstack/svelte-table@^9',
    )
    expect(document.body.textContent).toContain('createSvelteTable(options)')
    expect(document.body.textContent).toContain(
      'Replace FlexRender content/context props with {header} or {cell}.',
    )
    expect(localStorage.getItem('shad-table:framework')).toBe('svelte')
  })

  it('restores the saved framework', () => {
    localStorage.setItem('shad-table:framework', 'svelte')
    render(<MigrateV9Page />)
    expect(document.body.textContent).toContain('createSvelteTable')
  })
})
