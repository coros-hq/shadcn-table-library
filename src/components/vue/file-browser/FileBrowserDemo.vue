<script setup lang="ts">
import { computed, nextTick, ref, shallowRef } from 'vue'
import { ArrowUp, ChevronRight, Download, Trash2, X } from '@lucide/vue'
import type {
  ExpandedState,
  RowSelectionState,
  SortingState,
} from '@tanstack/vue-table'
import { Button } from '@/components/ui/button'
import { root as initialRoot } from './data'
import type { FolderEntry } from './data'
import FileTable from './FileTable.vue'
import { childToward, findPath, formatSize, removeIds, sizeOf } from './files'

// Replaced, never mutated, so a shallow ref is enough
const tree = shallowRef<FolderEntry>(initialRoot)
const folderId = ref('all-files/marketing')
const sorting = ref<SortingState>([])
const rowSelection = ref<RowSelectionState>({})
const expanded = ref<ExpandedState>({})
const message = ref('')

const nav = ref<HTMLElement>()
const frame = ref<HTMLElement>()

// A deleted folder can't stay open: fall back to the root
const path = computed(
  () => findPath(tree.value, folderId.value) ?? [tree.value],
)
const folder = computed(() => path.value[path.value.length - 1])
const parent = computed(() => path.value.at(-2))

/**
 * Opening a folder focuses its name in the breadcrumbs. Going back up
 * focuses the folder you came out of, so you keep your place.
 */
async function open(id: string) {
  const from = folder.value.id
  if (id === from) return
  folderId.value = id
  // Selection and open details belong to the folder you were in
  rowSelection.value = {}
  expanded.value = {}
  message.value = ''
  await nextTick()
  const el = from.startsWith(`${id}/`)
    ? frame.value?.querySelector<HTMLElement>(
        `[data-entry="${childToward(id, from)}"]`,
      )
    : nav.value?.querySelector<HTMLElement>('[aria-current="page"]')
  el?.focus()
}

const selected = computed(() =>
  folder.value.children.filter((c) => rowSelection.value[c.id]),
)
const selectedSize = computed(() =>
  selected.value.reduce((sum, e) => sum + sizeOf(e), 0),
)
const plural = (n: number) => (n === 1 ? 'item' : 'items')

function download() {
  const n = selected.value.length
  message.value = `Preparing ${n} ${plural(n)} (${formatSize(selectedSize.value)}) for download.`
}

function remove() {
  const n = selected.value.length
  tree.value = removeIds(tree.value, new Set(selected.value.map((e) => e.id)))
  rowSelection.value = {}
  message.value = `Deleted ${n} ${plural(n)}.`
}
</script>

<template>
  <div ref="frame" class="space-y-3">
    <div class="flex min-h-9 flex-wrap items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        class="size-8"
        :disabled="!parent"
        :aria-label="parent ? `Up to ${parent.name}` : 'Already at the top'"
        @click="parent && open(parent.id)"
      >
        <ArrowUp />
      </Button>
      <nav ref="nav" aria-label="Folder path" class="min-w-0 flex-1">
        <ol class="flex flex-wrap items-center gap-0.5 text-sm">
          <li
            v-for="(f, i) in path"
            :key="f.id"
            class="flex min-w-0 items-center gap-0.5"
          >
            <ChevronRight
              v-if="i > 0"
              aria-hidden="true"
              class="size-3.5 shrink-0 text-muted-foreground"
            />
            <span
              v-if="i === path.length - 1"
              aria-current="page"
              tabindex="-1"
              class="truncate rounded-sm px-1.5 py-1 font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {{ f.name }}
            </span>
            <button
              v-else
              type="button"
              class="truncate rounded-sm px-1.5 py-1 text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
              @click="open(f.id)"
            >
              {{ f.name }}
            </button>
          </li>
        </ol>
      </nav>
    </div>

    <div
      class="flex min-h-9 flex-wrap items-center justify-between gap-2 rounded-md bg-muted/50 px-3 py-1.5"
    >
      <template v-if="selected.length">
        <p class="text-sm tabular-nums">
          <span class="font-medium">{{ selected.length }} selected</span>
          <span class="text-muted-foreground">
            · {{ formatSize(selectedSize) }}</span
          >
        </p>
        <div class="flex items-center gap-1">
          <Button variant="ghost" size="sm" @click="download">
            <Download /> Download
          </Button>
          <Button
            variant="ghost"
            size="sm"
            class="text-destructive hover:text-destructive"
            @click="remove"
          >
            <Trash2 /> Delete
          </Button>
          <Button
            variant="ghost"
            size="icon"
            class="size-8"
            aria-label="Clear selection"
            @click="rowSelection = {}"
          >
            <X />
          </Button>
        </div>
      </template>
      <p v-else class="text-sm text-muted-foreground tabular-nums">
        {{ folder.children.length }} {{ plural(folder.children.length) }} ·
        {{ formatSize(sizeOf(folder)) }}
      </p>
      <p
        aria-live="polite"
        class="w-full text-xs text-muted-foreground empty:hidden"
      >
        {{ message }}
      </p>
    </div>

    <FileTable
      v-model:sorting="sorting"
      v-model:row-selection="rowSelection"
      v-model:expanded="expanded"
      :folder="folder"
      :path="path"
      :meta="{ open }"
    />

    <p class="text-xs text-muted-foreground">
      A folder's name opens it. A file's name shows its details.
    </p>
  </div>
</template>
