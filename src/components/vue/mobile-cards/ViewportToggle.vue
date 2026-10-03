<script setup lang="ts">
import { computed, ref } from 'vue'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

type View = 'mobile' | 'desktop'

const MOBILE_WIDTH = 375
// Comfortably past the table's 768px container-query threshold. This is a
// min-width, not a width — the preview pane itself is often narrower than
// 768px once the docs sidebar is accounted for, so "Desktop" has to force
// the simulated width (with horizontal scroll if needed) rather than just
// taking whatever room happens to be available, the same way a browser's
// device toolbar forces its simulated viewport.
const DESKTOP_MIN_WIDTH = 900

const view = ref<View>('desktop')

const frameStyle = computed(() =>
  view.value === 'mobile'
    ? { width: `${MOBILE_WIDTH}px`, maxWidth: '100%' }
    : { minWidth: `${DESKTOP_MIN_WIDTH}px` },
)
</script>

<template>
  <div>
    <Tabs v-model="view" class="mb-3">
      <TabsList>
        <TabsTrigger value="mobile">Mobile</TabsTrigger>
        <TabsTrigger value="desktop">Desktop</TabsTrigger>
      </TabsList>
    </Tabs>
    <div class="overflow-x-auto">
      <div class="mx-auto" :style="frameStyle">
        <slot />
      </div>
    </div>
  </div>
</template>
