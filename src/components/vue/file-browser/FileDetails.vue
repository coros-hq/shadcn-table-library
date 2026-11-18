<script setup lang="ts">
import type { FileEntry, FolderEntry } from './data'
import FileIcon from './FileIcon.vue'
import { details } from './files'

/** The expanded row: everything known about one file */
defineProps<{ file: FileEntry; path: FolderEntry[] }>()
</script>

<template>
  <div class="flex flex-col gap-4 py-2 pl-1 sm:flex-row">
    <div
      aria-hidden="true"
      class="flex size-20 shrink-0 items-center justify-center rounded-md border bg-muted/50"
    >
      <FileIcon :entry="file" class="size-8" />
    </div>
    <div class="min-w-0 flex-1 space-y-3">
      <dl
        class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm sm:grid-cols-[auto_1fr_auto_1fr]"
      >
        <div
          v-for="row in details(file, path)"
          :key="row.label"
          class="contents"
        >
          <dt class="text-muted-foreground">{{ row.label }}</dt>
          <dd class="min-w-0 break-words">{{ row.value }}</dd>
        </div>
      </dl>
      <ul
        v-if="file.tags.length"
        aria-label="Tags"
        class="flex flex-wrap gap-1.5"
      >
        <li
          v-for="tag in file.tags"
          :key="tag"
          class="rounded-full border px-2 py-0.5 text-xs text-muted-foreground"
        >
          {{ tag }}
        </li>
      </ul>
    </div>
  </div>
</template>
