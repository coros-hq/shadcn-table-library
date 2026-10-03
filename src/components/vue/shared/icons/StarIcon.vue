<script setup lang="ts">
import { useIconAnimation } from './useIconAnimation'

withDefaults(defineProps<{ size?: number; filled?: boolean }>(), {
  size: 28,
  filled: false,
})

const { animating, start, stop, bind } = useIconAnimation()
defineExpose({ startAnimation: start, stopAnimation: stop })
</script>

<template>
  <div class="icon" v-bind="bind">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      :width="size"
      :height="size"
      viewBox="0 0 256 256"
      :fill="filled ? 'currentColor' : 'none'"
      stroke="currentColor"
      stroke-width="18"
      stroke-linecap="round"
      stroke-linejoin="round"
      style="overflow: visible"
    >
      <path
        :class="{ twinkle: animating }"
        d="M128 36 150 98 216 100 163 139 182 202 128 165 74 202 93 139 40 100 106 98 Z"
      />
    </svg>
  </div>
</template>

<style scoped>
.icon {
  display: inline-flex;
  overflow: hidden;
}

/* One confident turn, paired with an anticipation dip and an overshoot pop. */
.twinkle {
  transform-box: view-box;
  transform-origin: 128px 132px;
  animation: twinkle 1.1s infinite;
}

@keyframes twinkle {
  0% { rotate: 0deg; scale: 1; animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1); }
  14% { scale: 0.92; }
  33% { scale: 1.18; }
  55% { scale: 1; }
  64% { rotate: 360deg; }
  100% { rotate: 360deg; scale: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .twinkle { animation: none; }
}
</style>
