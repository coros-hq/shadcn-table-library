<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { CircleAlert, Copy } from '@lucide/vue'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { Issue } from './review'

// A cell of a mapped column. Problems are shown in place, and clicking the
// cell opens an input to fix the value. Any value is accepted on commit: the
// review runs again and the highlight goes away once the value is valid.
const props = defineProps<{
  value: string
  issue?: Issue
  /** e.g. "Email, line 4" */
  label: string
}>()
const emit = defineEmits<{ commit: [value: string] }>()

const draft = ref<string | null>(null)
const input = ref<InstanceType<typeof Input> | null>(null)

async function edit() {
  draft.value = props.value
  await nextTick()
  ;(input.value?.$el as HTMLInputElement | undefined)?.focus()
}

function done(save: boolean) {
  if (draft.value === null) return
  if (save && draft.value !== props.value) emit('commit', draft.value)
  draft.value = null
}
</script>

<template>
  <Input
    v-if="draft !== null"
    ref="input"
    v-model="draft"
    :aria-label="label"
    class="h-8 min-w-32"
    @blur="done(true)"
    @keydown.enter="done(true)"
    @keydown.escape="done(false)"
  />
  <Tooltip v-else :disabled="!issue">
    <TooltipTrigger as-child>
      <button
        type="button"
        :aria-label="`${label}: ${value || 'empty'}${issue ? `. ${issue.message}` : ''}. Edit`"
        :class="
          cn(
            'flex h-8 w-full min-w-24 items-center gap-1.5 rounded-md px-2 text-left outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50',
            issue?.kind === 'invalid' &&
              'bg-destructive/10 text-destructive ring-1 ring-destructive/30 ring-inset hover:bg-destructive/15',
            issue?.kind === 'duplicate' &&
              'bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/40 ring-inset hover:bg-amber-500/15 dark:text-amber-400',
          )
        "
        @click="edit"
      >
        <span :class="cn('truncate', !value && 'italic opacity-70')">
          {{ value || 'Empty' }}
        </span>
        <CircleAlert
          v-if="issue?.kind === 'invalid'"
          class="ml-auto size-3.5 shrink-0"
        />
        <Copy
          v-else-if="issue?.kind === 'duplicate'"
          class="ml-auto size-3.5 shrink-0"
        />
      </button>
    </TooltipTrigger>
    <TooltipContent v-if="issue">{{ issue.message }}</TooltipContent>
  </Tooltip>
</template>
