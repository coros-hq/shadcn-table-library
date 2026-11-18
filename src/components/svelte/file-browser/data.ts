export type FileType =
  'pdf' | 'image' | 'doc' | 'sheet' | 'video' | 'archive' | 'design' | 'text'

export interface FileEntry {
  kind: 'file'
  /** The path from the root, e.g. "marketing/brand-assets/logo.svg" */
  id: string
  name: string
  type: FileType
  /** In bytes */
  size: number
  /** ISO dates, "2026-11-12" */
  created: string
  modified: string
  owner: string
  version: number
  tags: string[]
  /** Type-specific details, shown when the row is expanded */
  dimensions?: string
  pages?: number
  duration?: string
  sheets?: number
}

export interface FolderEntry {
  kind: 'folder'
  id: string
  name: string
  modified: string
  owner: string
  children: Entry[]
}

export type Entry = FileEntry | FolderEntry

type FileSpec = Omit<
  FileEntry,
  'kind' | 'id' | 'created' | 'version' | 'tags'
> &
  Partial<Pick<FileEntry, 'created' | 'version' | 'tags'>>

const KB = 1024
const MB = 1024 * KB

const file = (spec: FileSpec): FileEntry => ({
  kind: 'file',
  id: '',
  created: spec.modified,
  version: 1,
  tags: [],
  ...spec,
  size: Math.round(spec.size),
})

const folder = (
  name: string,
  owner: string,
  modified: string,
  children: Entry[],
): FolderEntry => ({ kind: 'folder', id: '', name, owner, modified, children })

/** Ids are paths, so they are unique and readable */
function withIds<T extends Entry>(entry: T, parent: string): T {
  const id = parent ? `${parent}/${slug(entry.name)}` : slug(entry.name)
  if (entry.kind === 'file') return { ...entry, id }
  return {
    ...entry,
    id,
    children: entry.children.map((c) => withIds(c, id)),
  }
}

const slug = (name: string) => name.toLowerCase().replace(/\s+/g, '-')

export const ROOT_ID = 'all-files'

export const root: FolderEntry = withIds(
  folder('All files', 'Workspace', '2026-11-16', [
    folder('Marketing', 'Maya Chen', '2026-11-14', [
      folder('Brand assets', 'Maya Chen', '2026-11-02', [
        file({
          name: 'logo-primary.svg',
          type: 'image',
          size: 24 * KB,
          modified: '2026-09-18',
          created: '2026-03-02',
          owner: 'Maya Chen',
          version: 4,
          dimensions: '512 × 512',
          tags: ['logo', 'approved'],
        }),
        file({
          name: 'logo-mark.png',
          type: 'image',
          size: 88 * KB,
          modified: '2026-09-18',
          owner: 'Maya Chen',
          version: 2,
          dimensions: '1024 × 1024',
          tags: ['logo'],
        }),
        file({
          name: 'brand-guidelines.pdf',
          type: 'pdf',
          size: 6.2 * MB,
          modified: '2026-11-02',
          created: '2026-04-11',
          owner: 'Maya Chen',
          version: 7,
          pages: 42,
          tags: ['approved', 'external'],
        }),
        folder('Photography', 'Leo Park', '2026-10-21', [
          file({
            name: 'office-hero.jpg',
            type: 'image',
            size: 3.4 * MB,
            modified: '2026-10-21',
            owner: 'Leo Park',
            dimensions: '4000 × 2667',
            tags: ['website'],
          }),
          file({
            name: 'team-offsite.jpg',
            type: 'image',
            size: 2.9 * MB,
            modified: '2026-10-19',
            owner: 'Leo Park',
            dimensions: '3600 × 2400',
          }),
        ]),
      ]),
      folder('Campaigns', 'Ines Duarte', '2026-11-14', [
        file({
          name: 'spring-launch-brief.docx',
          type: 'doc',
          size: 312 * KB,
          modified: '2026-11-14',
          created: '2026-10-30',
          owner: 'Ines Duarte',
          version: 3,
          pages: 8,
          tags: ['draft'],
        }),
        file({
          name: 'launch-teaser.mp4',
          type: 'video',
          size: 148 * MB,
          modified: '2026-11-09',
          owner: 'Leo Park',
          version: 2,
          duration: '1:42',
          dimensions: '1920 × 1080',
          tags: ['review'],
        }),
      ]),
      file({
        name: 'social-calendar.xlsx',
        type: 'sheet',
        size: 96 * KB,
        modified: '2026-11-11',
        owner: 'Ines Duarte',
        version: 12,
        sheets: 4,
      }),
    ]),
    folder('Finance', 'Sam Okoro', '2026-11-16', [
      folder('Invoices 2026', 'Sam Okoro', '2026-11-16', [
        file({
          name: 'INV-2026-0912.pdf',
          type: 'pdf',
          size: 182 * KB,
          modified: '2026-09-12',
          owner: 'Sam Okoro',
          pages: 2,
          tags: ['paid'],
        }),
        file({
          name: 'INV-2026-1014.pdf',
          type: 'pdf',
          size: 176 * KB,
          modified: '2026-10-14',
          owner: 'Sam Okoro',
          pages: 2,
          tags: ['paid'],
        }),
        file({
          name: 'INV-2026-1116.pdf',
          type: 'pdf',
          size: 190 * KB,
          modified: '2026-11-16',
          owner: 'Sam Okoro',
          pages: 3,
          tags: ['due'],
        }),
      ]),
      file({
        name: 'budget-2027.xlsx',
        type: 'sheet',
        size: 1.1 * MB,
        modified: '2026-11-15',
        created: '2026-08-01',
        owner: 'Sam Okoro',
        version: 23,
        sheets: 9,
        tags: ['confidential'],
      }),
      file({
        name: 'q3-report.pdf',
        type: 'pdf',
        size: 2.4 * MB,
        modified: '2026-10-08',
        owner: 'Sam Okoro',
        version: 2,
        pages: 18,
      }),
    ]),
    folder('Product', 'Ari Novak', '2026-11-13', [
      file({
        name: 'app-screens.fig',
        type: 'design',
        size: 38 * MB,
        modified: '2026-11-13',
        created: '2026-06-20',
        owner: 'Ari Novak',
        version: 31,
        tags: ['in progress'],
      }),
      file({
        name: 'release-notes.md',
        type: 'text',
        size: 14 * KB,
        modified: '2026-11-10',
        owner: 'Ari Novak',
        version: 9,
      }),
    ]),
    folder('Legal', 'Sam Okoro', '2026-07-01', []),
    file({
      name: 'onboarding-handbook.pdf',
      type: 'pdf',
      size: 4.8 * MB,
      modified: '2026-10-28',
      created: '2026-01-15',
      owner: 'Workspace',
      version: 5,
      pages: 36,
      tags: ['internal'],
    }),
    file({
      name: 'team-photos.zip',
      type: 'archive',
      size: 512 * MB,
      modified: '2026-08-30',
      owner: 'Leo Park',
    }),
  ]),
  '',
)
