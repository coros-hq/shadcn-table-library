<script setup lang="ts">
import { computed } from 'vue'
import {
  File,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Folder,
  PenTool,
} from '@lucide/vue'
import { cn } from '@/lib/utils'
import type { Entry, FileType } from './data'

/** The icon is decoration: the Type column says the same in words */
const props = defineProps<{ entry: Entry; class?: string }>()

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

const look = computed(() =>
  props.entry.kind === 'folder'
    ? { icon: Folder, color: 'text-sky-600 dark:text-sky-400' }
    : icons[props.entry.type],
)
</script>

<template>
  <component
    :is="look.icon"
    aria-hidden="true"
    :class="
      cn(
        'size-4 shrink-0',
        look.color,
        entry.kind === 'folder' && 'fill-current/15',
        props.class,
      )
    "
  />
</template>
