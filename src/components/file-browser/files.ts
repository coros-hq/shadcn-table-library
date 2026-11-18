import type { Entry, FileEntry, FileType, FolderEntry } from './data'

/** The folders from the root down to `id`, or null if it no longer exists */
export function findPath(
  folder: FolderEntry,
  id: string,
): FolderEntry[] | null {
  if (folder.id === id) return [folder]
  for (const child of folder.children) {
    if (child.kind !== 'folder') continue
    const path = findPath(child, id)
    if (path) return [folder, ...path]
  }
  return null
}

/** The entry inside `ancestorId` that leads down to `descendantId` */
export const childToward = (ancestorId: string, descendantId: string) =>
  `${ancestorId}/${descendantId.slice(ancestorId.length + 1).split('/')[0]}`

/** A file's size, or everything inside a folder */
export const sizeOf = (entry: Entry): number =>
  entry.kind === 'file'
    ? entry.size
    : entry.children.reduce((sum, c) => sum + sizeOf(c), 0)

export type SortKey = 'name' | 'size' | 'modified'
export interface Sort {
  id: SortKey
  desc: boolean
}

/** Folders always come first, whichever way the column is sorted */
export function sortEntries(entries: Entry[], sort: Sort): Entry[] {
  const dir = sort.desc ? -1 : 1
  const by: Record<SortKey, (a: Entry, b: Entry) => number> = {
    name: (a, b) =>
      a.name.localeCompare(b.name, 'en', {
        numeric: true,
        sensitivity: 'base',
      }),
    size: (a, b) => sizeOf(a) - sizeOf(b),
    modified: (a, b) => a.modified.localeCompare(b.modified),
  }
  return [...entries].sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'folder' ? -1 : 1
    return by[sort.id](a, b) * dir || by.name(a, b)
  })
}

/** The tree without the given entries, wherever they are */
export function removeIds(folder: FolderEntry, ids: Set<string>): FolderEntry {
  return {
    ...folder,
    children: folder.children
      .filter((c) => !ids.has(c.id))
      .map((c) => (c.kind === 'folder' ? removeIds(c, ids) : c)),
  }
}

export function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let n = bytes / 1024
  let i = 0
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024
    i++
  }
  return `${n >= 10 ? Math.round(n) : n.toFixed(1).replace(/\.0$/, '')} ${units[i]}`
}

const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

/** "2026-11-12" → "Nov 12, 2026", without Date, so time zones can't shift it */
export function formatDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return `${monthNames[m - 1]} ${d}, ${y}`
}

export const typeLabels: Record<FileType, string> = {
  pdf: 'PDF document',
  image: 'Image',
  doc: 'Word document',
  sheet: 'Spreadsheet',
  video: 'Video',
  archive: 'ZIP archive',
  design: 'Figma file',
  text: 'Markdown',
}

export const kindLabel = (entry: Entry) =>
  entry.kind === 'folder' ? 'Folder' : typeLabels[entry.type]

export const itemCount = (folder: FolderEntry) => {
  const n = folder.children.length
  return n === 0 ? 'Empty' : `${n} ${n === 1 ? 'item' : 'items'}`
}

/** The facts for a file's expanded row, type-specific ones first */
export function details(file: FileEntry, path: FolderEntry[]) {
  const rows: { label: string; value: string }[] = []
  if (file.dimensions)
    rows.push({ label: 'Dimensions', value: file.dimensions })
  if (file.pages) rows.push({ label: 'Pages', value: String(file.pages) })
  if (file.duration) rows.push({ label: 'Duration', value: file.duration })
  if (file.sheets) rows.push({ label: 'Sheets', value: String(file.sheets) })
  rows.push(
    { label: 'Type', value: typeLabels[file.type] },
    {
      label: 'Size',
      value: `${formatSize(file.size)} (${file.size.toLocaleString('en-US')} bytes)`,
    },
    { label: 'Created', value: formatDate(file.created) },
    { label: 'Modified', value: formatDate(file.modified) },
    { label: 'Owner', value: file.owner },
    { label: 'Version', value: `v${file.version}` },
    { label: 'Location', value: path.map((f) => f.name).join(' / ') },
  )
  return rows
}
