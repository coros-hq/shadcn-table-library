<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const props = defineProps<{
  value: number
  /** Return an error message to block the commit, or null to accept it. */
  validate?: (value: number) => string | null
  suffix?: string
  label: string
  disabled?: boolean
}>()

const emit = defineEmits<{ commit: [value: number] }>()

const draft = ref<string | null>(null)
const error = ref<string | null>(null)

function commit() {
  if (draft.value === null) return
  const n = Number(draft.value)
  const message =
    draft.value.trim() === '' || !Number.isInteger(n) || n < 0
      ? 'Enter a whole number ≥ 0'
      : (props.validate?.(n) ?? null)

  // An invalid value keeps the input open so the user can fix it in place,
  // rather than silently snapping back to the old number.
  if (message) {
    error.value = message
    return
  }
  draft.value = null
  error.value = null
  if (n !== props.value) emit('commit', n)
}

function cancel() {
  draft.value = null
  error.value = null
}

function focus(vnode: { el: unknown }) {
  ;(vnode.el as HTMLElement).focus()
}
</script>

<template>
  <div v-if="draft !== null" class="w-24">
    <Input
      type="number"
      inputmode="numeric"
      min="0"
      :aria-label="label"
      :aria-invalid="error ? true : undefined"
      :model-value="draft"
      class="h-7 px-2 tabular-nums"
      @update:model-value="
        (next) => {
          draft = String(next)
          error = null
        }
      "
      @blur="error ? cancel() : commit()"
      @keydown.enter="commit"
      @keydown.esc="cancel"
      @vue:mounted="focus"
    />
    <p v-if="error" role="alert" class="mt-1 text-xs text-destructive">
      {{ error }}
    </p>
  </div>

  <button
    v-else
    type="button"
    :disabled="disabled"
    :aria-label="`Edit ${label}`"
    :class="
      cn(
        '-mx-1.5 rounded border border-dashed border-transparent px-1.5 py-1 text-left tabular-nums',
        'hover:border-border hover:bg-muted focus-visible:border-ring focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-transparent disabled:hover:bg-transparent',
      )
    "
    @click="draft = String(value)"
  >
    {{ value.toLocaleString() }}
    <span v-if="suffix" class="text-muted-foreground"> {{ suffix }}</span>
  </button>
</template>
