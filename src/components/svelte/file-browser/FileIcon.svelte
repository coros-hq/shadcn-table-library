<script lang="ts">
  import File from '@lucide/svelte/icons/file'
  import FileArchive from '@lucide/svelte/icons/file-archive'
  import FileImage from '@lucide/svelte/icons/file-image'
  import FileSpreadsheet from '@lucide/svelte/icons/file-spreadsheet'
  import FileText from '@lucide/svelte/icons/file-text'
  import FileVideo from '@lucide/svelte/icons/file-video'
  import Folder from '@lucide/svelte/icons/folder'
  import PenTool from '@lucide/svelte/icons/pen-tool'
  import { cn } from '$lib/utils.js'
  import type { Entry, FileType } from './data'

  // The icon is decoration: the Type column says the same in words
  let { entry, class: className }: { entry: Entry; class?: string } = $props()

  const icons: Record<FileType, { icon: typeof File; color: string }> = {
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

  const look = $derived(
    entry.kind === 'folder'
      ? { icon: Folder, color: 'text-sky-600 dark:text-sky-400' }
      : icons[entry.type],
  )
</script>

<look.icon
  aria-hidden="true"
  class={cn(
    'size-4 shrink-0',
    look.color,
    entry.kind === 'folder' && 'fill-current/15',
    className,
  )}
/>
