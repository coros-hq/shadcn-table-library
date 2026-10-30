import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { ComponentPreview } from '#/components/docs/component-preview.tsx'

const files = [{ path: 'src/components/x/react.tsx', code: 'react code' }]
const vueFiles = [{ path: 'src/components/x/Table.vue', code: 'vue code' }]
const svelteFiles = [
  { path: 'src/lib/components/x/Table.svelte', code: 'svelte code' },
]

function renderPreview(props: Partial<Parameters<typeof ComponentPreview>[0]>) {
  return render(
    <ComponentPreview preview={<div>live</div>} files={files} {...props} />,
  )
}

// Radix tabs activate on mousedown, not click
const choose = (name: string) =>
  fireEvent.mouseDown(screen.getByRole('tab', { name }), { button: 0 })

describe('ComponentPreview framework toggle', () => {
  beforeEach(() => localStorage.clear())

  it('offers only the frameworks a page has code for', () => {
    renderPreview({ svelteFiles })
    expect(screen.getByRole('tab', { name: 'Svelte' })).toBeTruthy()
    expect(screen.queryByRole('tab', { name: 'Vue' })).toBeNull()
  })

  it('shows no toggle when there is only React code', () => {
    renderPreview({})
    expect(screen.queryByRole('tab', { name: 'React' })).toBeNull()
  })

  it('switches the code tab to Svelte and lists its install commands', () => {
    renderPreview({
      vueFiles,
      svelteFiles,
      svelteDeps: { npm: ['@lucide/svelte'], shadcn: ['table'], adapter: true },
    })
    choose('Code')
    choose('Svelte')
    expect(screen.getByRole('tab', { name: 'Table.svelte' })).toBeTruthy()
    expect(document.body.textContent).toContain(
      'npm i @tanstack/table-core@^8 @lucide/svelte',
    )
    expect(document.body.textContent).toContain(
      'npx shadcn-svelte@latest add table',
    )
    expect(
      screen.getByRole('tab', { name: 'data-table.svelte.ts' }),
    ).toBeTruthy()
    expect(localStorage.getItem('shad-table:framework')).toBe('svelte')
  })

  it('falls back to React when the saved framework has no code on this page', () => {
    localStorage.setItem('shad-table:framework', 'svelte')
    renderPreview({ vueFiles })
    choose('Code')
    expect(screen.getByRole('tab', { name: 'react.tsx' })).toBeTruthy()
  })
})
