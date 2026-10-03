<script setup lang="ts">
import { computed } from 'vue'

/** Wraps every case-insensitive match of `query` in a <mark> */
const props = defineProps<{ text: string; query: string }>()

const parts = computed(() => {
  const q = props.query.trim()
  if (!q) return [props.text]
  return props.text.split(
    new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
  )
})
</script>

<template>
  <template v-for="(part, i) in parts" :key="i">
    <mark
      v-if="i % 2 === 1"
      class="rounded-[2px] bg-yellow-300/60 text-foreground dark:bg-yellow-500/40"
    >
      {{ part }}
    </mark>
    <template v-else>{{ part }}</template>
  </template>
</template>
