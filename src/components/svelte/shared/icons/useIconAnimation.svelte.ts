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
  let animating = $state(false)

  const start = () => {
    animating = true
  }
  const stop = () => {
    animating = false
  }

  return {
    get animating() {
      return animating
    },
    start,
    stop,
    // One-shot icons clear themselves so they can be triggered again
    onAnimationEnd: () => {
      if (!loop) animating = false
    },
    // Keyboard focus triggers it too, not just pointer
    bind: {
      onmouseenter: start,
      onmouseleave: stop,
      onfocusin: start,
      onfocusout: stop,
    },
  }
}
