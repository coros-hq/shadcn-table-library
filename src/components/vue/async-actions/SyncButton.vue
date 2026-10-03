<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import ArrowsClockwiseIcon from '@/components/ui/icons/ArrowsClockwiseIcon.vue'
import type { IconHandle } from '@/components/ui/icons/useIconAnimation'
import { cn } from '@/lib/utils'
import { actionButtonBase } from './actionButtonStyles'

const props = defineProps<{ status: 'synced' | 'syncing' | 'failed' }>()
const emit = defineEmits<{ sync: [] }>()

// The button, not the icon, owns the animation. The icon gets
// pointer-events-none so its own hover handlers can't stop a spin that a
// pending request started.
const icon = ref<IconHandle | null>(null)
const syncing = computed(() => props.status === 'syncing')

// The refresh icon spins once per start, so re-trigger it for as long as
// the request is pending.
watchEffect((onCleanup) => {
  if (!syncing.value) return
  icon.value?.startAnimation()
  const id = window.setInterval(() => icon.value?.startAnimation(), 900)
  onCleanup(() => {
    window.clearInterval(id)
    icon.value?.stopAnimation()
  })
})

const start = () => icon.value?.startAnimation()
const stop = () => {
  if (!syncing.value) icon.value?.stopAnimation()
}
</script>

<template>
  <button
    type="button"
    :disabled="syncing"
    :aria-busy="syncing"
    :class="cn(actionButtonBase, 'w-24', syncing && 'text-foreground')"
    @click="emit('sync')"
    @mouseenter="start"
    @focus="start"
    @mouseleave="stop"
    @blur="stop"
  >
    <ArrowsClockwiseIcon ref="icon" :size="16" class="pointer-events-none" />
    {{ syncing ? 'Syncing…' : status === 'failed' ? 'Retry' : 'Sync' }}
  </button>
</template>
