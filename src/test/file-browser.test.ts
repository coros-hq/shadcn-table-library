import { describe, expect, it } from 'vitest'
import { root } from '#/components/file-browser/data'
import type { FolderEntry } from '#/components/file-browser/data'
import {
  childToward,
  details,
  findPath,
  formatDate,
  formatSize,
  itemCount,
  removeIds,
  sizeOf,
  sortEntries,
} from '#/components/file-browser/files'

const marketing = 'all-files/marketing'

describe('tree', () => {
  it('gives every entry a unique path id', () => {
    const ids: string[] = []
    const walk = (f: FolderEntry) =>
      f.children.forEach((c) => {
        ids.push(c.id)
        if (c.kind === 'folder') walk(c)
      })
    walk(root)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).toContain('all-files/marketing/brand-assets/photography')
  })

  it('finds the path from the root to a folder', () => {
    const path = findPath(root, 'all-files/marketing/brand-assets/photography')
    expect(path?.map((f) => f.name)).toEqual([
      'All files',
      'Marketing',
      'Brand assets',
      'Photography',
    ])
    expect(findPath(root, 'all-files/nope')).toBeNull()
  })

  it('knows which child leads down to a folder', () => {
    expect(
      childToward('all-files', 'all-files/marketing/brand-assets/photography'),
    ).toBe(marketing)
  })
})

describe('sizes', () => {
  it('adds up everything inside a folder', () => {
    const folder = findPath(root, marketing)!.at(-1)!
    const files: number[] = []
    const walk = (f: FolderEntry) =>
      f.children.forEach((c) =>
        c.kind === 'folder' ? walk(c) : files.push(c.size),
      )
    walk(folder)
    expect(sizeOf(folder)).toBe(files.reduce((a, b) => a + b, 0))
  })

  it('formats sizes and counts', () => {
    expect(formatSize(512)).toBe('512 B')
    expect(formatSize(24 * 1024)).toBe('24 KB')
    expect(formatSize(6.2 * 1024 * 1024)).toBe('6.2 MB')
    expect(formatSize(512 * 1024 * 1024)).toBe('512 MB')
    const legal = findPath(root, 'all-files/legal')!.at(-1)!
    expect(itemCount(legal)).toBe('Empty')
  })
})

describe('sortEntries', () => {
  it('keeps folders first in both directions', () => {
    for (const desc of [false, true]) {
      const sorted = sortEntries(root.children, { id: 'size', desc })
      const kinds = sorted.map((e) => e.kind)
      expect(kinds.indexOf('file')).toBe(kinds.lastIndexOf('folder') + 1)
    }
  })

  it('sorts by size within files', () => {
    const files = sortEntries(root.children, { id: 'size', desc: true }).filter(
      (e) => e.kind === 'file',
    )
    expect(files.map((f) => f.name)).toEqual([
      'team-photos.zip',
      'onboarding-handbook.pdf',
    ])
  })
})

describe('removeIds', () => {
  it('removes entries anywhere and leaves the rest', () => {
    const next = removeIds(
      root,
      new Set(['all-files/legal', 'all-files/finance/q3-report.pdf']),
    )
    expect(findPath(next, 'all-files/legal')).toBeNull()
    const finance = findPath(next, 'all-files/finance')!.at(-1)!
    expect(finance.children.map((c) => c.name)).not.toContain('q3-report.pdf')
    expect(findPath(root, 'all-files/legal')).not.toBeNull()
  })
})

describe('details', () => {
  it('lists type-specific facts first, then the common ones', () => {
    const path = findPath(root, 'all-files/marketing/brand-assets')!
    const pdf = path
      .at(-1)!
      .children.find((c) => c.name === 'brand-guidelines.pdf')
    if (pdf?.kind !== 'file') throw new Error('missing fixture')
    const rows = details(pdf, path)
    expect(rows[0]).toEqual({ label: 'Pages', value: '42' })
    expect(rows.find((r) => r.label === 'Location')?.value).toBe(
      'All files / Marketing / Brand assets',
    )
    expect(formatDate('2026-11-02')).toBe('Nov 2, 2026')
  })
})
