import { ref } from 'vue'

/** Imperative handle every icon exposes — lets consumers trigger motion on touch, where `:hover` never fires. */
export interface IconHandle {
  startAnimation: () => void
  stopAnimation: () => void
}

/**
 * Shared runtime for the animated icons. Each icon only defines its own CSS
 * keyframes and markup; this holds the hover / focus wiring they'd otherwise
 * repeat. `loop: true` keeps the motion replaying while hovered or focused
 * (the keyframes carry their own rest period); `loop: false` plays it once.
 */
export function useIconAnimation({ loop = true }: { loop?: boolean } = {}) {
  const animating = ref(false)

  const start = () => {
    animating.value = true
  }
  const stop = () => {
    animating.value = false
  }

  return {
    animating,
    start,
    stop,
    // One-shot icons clear themselves so they can be triggered again
    onAnimationEnd: () => {
      if (!loop) animating.value = false
    },
    // Keyboard focus triggers it too, not just pointer
    bind: {
      onMouseenter: start,
      onMouseleave: stop,
      onFocusin: start,
      onFocusout: stop,
    },
  }
}
