<script setup lang="ts">
import { useIconAnimation } from './useIconAnimation'

withDefaults(defineProps<{ size?: number }>(), { size: 28 })

// RING + EMIT — the bell rocks, the clapper trails it, and sound leaves as two
// wavefronts that travel outward and fade, twice over the gesture.
const ARC_R =
  'M224,71.1a8,8,0,0,1-10.78-3.42,94.13,94.13,0,0,0-33.46-36.91,8,8,0,1,1,8.54-13.54,111.46,111.46,0,0,1,39.12,43.09A8,8,0,0,1,224,71.1Z'
const ARC_L =
  'M35.71,72a8,8,0,0,0,7.1-4.32A94.13,94.13,0,0,1,76.27,30.77a8,8,0,1,0-8.54-13.54A111.46,111.46,0,0,0,28.61,60.32,8,8,0,0,0,35.71,72Z'
const SHELL =
  'M221.81,175.94A16,16,0,0,1,208,200H48a16,16,0,0,1-13.79-24.06C43.22,160.39,48,138.28,48,112a80,80,0,0,1,160,0C208,138.27,212.78,160.38,221.81,175.94Z' +
  'M208,184c-10.64-18.27-16-42.49-16-72a64,64,0,0,0-128,0c0,29.52-5.38,53.74-16,72Z'
const CLAPPER =
  'M167.2,200a40,40,0,0,1-78.4,0L105.38,200a24,24,0,0,0,45.24,0Z'

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
      fill="currentColor"
      style="overflow: visible"
      :class="{ ringing: animating }"
    >
      <!-- The arcs sit outside the shell group: sound doesn't swing with the bell. -->
      <g class="arcs">
        <path :d="ARC_L" />
        <path :d="ARC_R" />
      </g>
      <g class="shell">
        <path :d="SHELL" />
        <path class="clapper" :d="CLAPPER" />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.icon {
  display: inline-flex;
  overflow: hidden;
}

.arcs,
.shell,
.clapper {
  transform-box: view-box;
}
.arcs { transform-origin: 128px 112px; }
.shell { transform-origin: 128px 32px; }

.ringing .arcs { animation: arcs 1.15s ease-in-out infinite; }
.ringing .shell { animation: shell 1.15s ease-in-out infinite; }
.ringing .clapper { animation: clapper 1.15s ease-in-out infinite; }

/* 0.85s of motion, then a short rest before it replays */
@keyframes shell {
  0% { rotate: 0deg; }
  14.8% { rotate: -11deg; }
  32.5% { rotate: 12deg; }
  47.4% { rotate: -9.5deg; }
  59.3% { rotate: 7.4deg; }
  68.1% { rotate: -2.5deg; }
  73.9%, 100% { rotate: 0deg; }
}
@keyframes clapper {
  0% { translate: 0; }
  17.8% { translate: -16px; }
  35.5% { translate: 16px; }
  50.4% { translate: -13px; }
  62.2% { translate: 9px; }
  69.6% { translate: -3.5px; }
  73.9%, 100% { translate: 0; }
}
@keyframes arcs {
  0% { scale: 1; opacity: 1; }
  16.3% { scale: 1.14; opacity: 0.25; }
  32.5% { scale: 1; opacity: 1; }
  48.8% { scale: 1.14; opacity: 0.35; }
  73.9%, 100% { scale: 1; opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .ringing .arcs,
  .ringing .shell,
  .ringing .clapper { animation: none; }
}
</style>
