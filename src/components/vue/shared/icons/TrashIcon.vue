<script setup lang="ts">
import { useIconAnimation } from './useIconAnimation'

withDefaults(defineProps<{ size?: number }>(), { size: 28 })

// One-shot "toss": the lid swings up on its left hinge and lifts clear of the rim,
// then drops back down with a small bounce.
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
      fill="none"
      stroke="currentColor"
      stroke-width="18"
      stroke-linecap="round"
      stroke-linejoin="round"
      style="overflow: visible"
    >
      <!-- can body: rounded-bottom bin that tapers in, with two vertical ribs -->
      <path d="M74 92l7 110a16 16 0 0 0 16 15h62a16 16 0 0 0 16-15l7-110" />
      <path d="M112 120v72" />
      <path d="M144 120v72" />
      <!-- lid: rim bar + small handle, hinges and lifts from its left end -->
      <g :class="['lid', { tossing: animating }]">
        <path d="M56 70h144" />
        <path d="M104 70V58a10 10 0 0 1 10-10h28a10 10 0 0 1 10 10v12" />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.icon {
  display: inline-flex;
  overflow: hidden;
}

.lid {
  transform-box: view-box;
  transform-origin: 56px 70px;
}
.tossing { animation: toss 0.7s ease-in-out infinite; }

@keyframes toss {
  0% { transform: translateY(0) rotate(0deg); }
  32% { transform: translateY(-10px) rotate(-22deg); }
  62% { transform: translateY(2px) rotate(7deg); }
  82% { transform: translateY(-1px) rotate(-3deg); }
  100% { transform: translateY(0) rotate(0deg); }
}

@media (prefers-reduced-motion: reduce) {
  .tossing { animation: none; }
}
</style>
