<script setup lang="ts">
import { useIconAnimation } from './useIconAnimation'

withDefaults(defineProps<{ size?: number }>(), { size: 28 })

// STASH — the lid lifts and tilts open on a left-edge hinge, a label drops into the
// box, then the lid swings shut with a small squash on impact.
const LID =
  'M32,48H224a16,16,0,0,1,16,16V88a16,16,0,0,1-16,16H32a16,16,0,0,1-16-16V64A16,16,0,0,1,32,48ZM32,64H224V88H32Z'
const BOX =
  'M32,104H224V192a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16ZM48,104H208V192H48Z'
const SLOT = 'M96,136a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H104A8,8,0,0,1,96,136Z'

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
      :class="{ stashing: animating }"
    >
      <g class="box">
        <path :d="BOX" fill-rule="evenodd" />
      </g>
      <path class="label" :d="SLOT" />
      <path class="lid" :d="LID" fill-rule="evenodd" />
    </svg>
  </div>
</template>

<style scoped>
.icon {
  display: inline-flex;
  overflow: hidden;
}

.box,
.label,
.lid {
  transform-box: view-box;
}
.box { transform-origin: 128px 207px; }
.lid { transform-origin: 16px 104px; }

.stashing .box { animation: box 1.2s ease-out infinite; }
.stashing .label { animation: label 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) infinite; }
.stashing .lid { animation: lid 1.2s ease-in-out infinite; }

@keyframes lid {
  0% { transform: translateY(0) rotate(0deg); }
  22% { transform: translateY(-24px) rotate(-10deg); }
  58% { transform: translateY(-24px) rotate(-10deg); }
  82%, 100% { transform: translateY(0) rotate(0deg); }
}
@keyframes label {
  0%, 30% { transform: translateY(-26px); opacity: 0; }
  58%, 100% { transform: translateY(0); opacity: 1; }
}
@keyframes box {
  0%, 78% { transform: scaleY(1); }
  86% { transform: scaleY(0.93); }
  94% { transform: scaleY(1.02); }
  100% { transform: scaleY(1); }
}

@media (prefers-reduced-motion: reduce) {
  .stashing .box,
  .stashing .label,
  .stashing .lid { animation: none; }
}
</style>
