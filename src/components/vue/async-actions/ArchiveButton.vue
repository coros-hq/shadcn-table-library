<script setup lang="ts">
import { ref } from 'vue'
import ArchiveIcon from '@/components/ui/icons/ArchiveIcon.vue'
import type { IconHandle } from '@/components/ui/icons/useIconAnimation'
import { cn } from '@/lib/utils'
import { actionButtonBase } from './actionButtonStyles'

defineProps<{
  name: string
  disabled?: boolean
  /** Hidden (but still taking space) while Delete asks for confirmation */
  concealed?: boolean
}>()
const emit = defineEmits<{ archive: [] }>()

const icon = ref<IconHandle | null>(null)

function onClick() {
  icon.value?.startAnimation()
  emit('archive')
}
</script>

<template>
  <button
    type="button"
    :aria-label="`Archive ${name}`"
    title="Archive"
    :disabled="disabled"
    :aria-hidden="concealed"
    :tabindex="concealed ? -1 : undefined"
    :class="
      cn(
        actionButtonBase,
        'w-8 justify-center px-0 disabled:opacity-40',
        concealed && 'invisible',
      )
    "
    @click="onClick"
    @mouseenter="icon?.startAnimation()"
    @focus="icon?.startAnimation()"
    @mouseleave="icon?.stopAnimation()"
    @blur="icon?.stopAnimation()"
  >
    <ArchiveIcon ref="icon" :size="16" class="pointer-events-none" />
  </button>
</template>
