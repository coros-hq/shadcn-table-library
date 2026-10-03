<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import TrashIcon from '@/components/ui/icons/TrashIcon.vue'
import type { IconHandle } from '@/components/ui/icons/useIconAnimation'
import { cn } from '@/lib/utils'
import { actionButtonBase } from './actionButtonStyles'

const props = defineProps<{
  name: string
  confirming: boolean
  disabled?: boolean
}>()
const emit = defineEmits<{ request: []; confirm: []; cancel: [] }>()

const icon = ref<IconHandle | null>(null)
const button = ref<HTMLButtonElement | null>(null)

// While waiting for the second click: keep the lid moving, and cancel on
// Escape or a click anywhere else. Listening on the document works even
// when the click didn't focus the button (Safari and Firefox on macOS).
watchEffect((onCleanup) => {
  if (!props.confirming) return
  icon.value?.startAnimation()
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') emit('cancel')
  }
  const onPointerDown = (e: PointerEvent) => {
    if (!button.value?.contains(e.target as Node)) emit('cancel')
  }
  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('pointerdown', onPointerDown)
  onCleanup(() => {
    document.removeEventListener('keydown', onKeyDown)
    document.removeEventListener('pointerdown', onPointerDown)
    icon.value?.stopAnimation()
  })
})

const stop = () => {
  if (!props.confirming) icon.value?.stopAnimation()
}
</script>

<template>
  <!-- A fixed slot: the Confirm state grows leftward over the Archive slot
       instead of pushing the other actions around. -->
  <div class="relative size-8 shrink-0">
    <button
      ref="button"
      type="button"
      :aria-label="confirming ? `Confirm delete ${name}` : `Delete ${name}`"
      :title="confirming ? 'Click again to delete' : 'Delete'"
      :disabled="disabled"
      :class="
        cn(
          actionButtonBase,
          'absolute top-0 right-0 justify-center disabled:opacity-40',
          confirming
            ? 'bg-destructive/10 text-destructive hover:bg-destructive/15 hover:text-destructive'
            : 'w-8 px-0 hover:bg-destructive/10 hover:text-destructive',
        )
      "
      @click="confirming ? emit('confirm') : emit('request')"
      @mouseenter="icon?.startAnimation()"
      @focus="icon?.startAnimation()"
      @mouseleave="stop"
      @blur="stop"
    >
      <TrashIcon ref="icon" :size="16" class="pointer-events-none" />
      <template v-if="confirming">Confirm</template>
    </button>
  </div>
</template>
