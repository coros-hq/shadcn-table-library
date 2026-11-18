import {
  File,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Folder,
  PenTool,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '#/lib/utils'
import type { Entry, FileType } from './data'

const icons: Record<FileType, { icon: LucideIcon; color: string }> = {
  pdf: { icon: FileText, color: 'text-red-600 dark:text-red-400' },
  image: { icon: FileImage, color: 'text-violet-600 dark:text-violet-400' },
  doc: { icon: FileText, color: 'text-blue-600 dark:text-blue-400' },
  sheet: {
    icon: FileSpreadsheet,
    color: 'text-emerald-600 dark:text-emerald-400',
  },
  video: { icon: FileVideo, color: 'text-amber-600 dark:text-amber-400' },
  archive: { icon: FileArchive, color: 'text-muted-foreground' },
  design: { icon: PenTool, color: 'text-pink-600 dark:text-pink-400' },
  text: { icon: File, color: 'text-muted-foreground' },
}

/** The icon is decoration: the Type column says the same in words */
export function FileIcon({
  entry,
  className,
}: {
  entry: Entry
  className?: string
}) {
  const { icon: Icon, color } =
    entry.kind === 'folder'
      ? { icon: Folder, color: 'text-sky-600 dark:text-sky-400' }
      : icons[entry.type]
  return (
    <Icon
      aria-hidden
      className={cn(
        'size-4 shrink-0',
        color,
        entry.kind === 'folder' && 'fill-current/15',
        className,
      )}
    />
  )
}
