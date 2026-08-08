import { useCallback, useEffect, useRef } from 'react'
import { useAnimation, useReducedMotion } from 'motion/react'
import type { DOMAttributes, HTMLAttributes } from 'react'
import type { Transition } from 'motion/react'

/**
 * Shared runtime for the Iconimate-derived animated icons in `#/components/ui/icons`.
 * Each icon file only defines its own motion variants + markup; this holds the
 * boilerplate every one of them would otherwise repeat (adapted from
 * https://github.com/smammar100/Iconimate).
 */

/** Imperative handle every icon exposes — lets consumers trigger motion on touch, where `:hover` never fires. */
export interface IconHandle {
  startAnimation: () => void
  stopAnimation: () => void
}

export interface IconProps extends HTMLAttributes<HTMLDivElement> {
  /** Rendered width & height in px. Defaults to 28; the set is calibrated to read at 24 (ship size). */
  size?: number
}

/** A cubic-bezier easing curve. */
export type Bezier = [number, number, number, number]

/** Decelerate-to-rest with an expo-out tail — things landing / arriving. */
export const ARRIVE: Bezier = [0.16, 1, 0.3, 1]

/** Gentle standard glide — used by every "normal" variant for hover-out. */
export const RETURN: Bezier = [0.4, 0, 0.2, 1]

/** Exaggeration — an ease that overshoots its target then eases back. */
export const OVERSHOOT_BACK: Bezier = [0.34, 1.56, 0.64, 1]

/** Duration scale in seconds, calibrated for legibility at the 24px ship size. */
export const DUR = { instant: 0.12, fast: 0.2, base: 0.32, slow: 0.5 } as const

/** The canonical hover-out transition, spread into every "normal" variant. */
export const RETURN_TRANSITION: Transition = { duration: DUR.base, ease: RETURN }

/** Anticipation — the "wind-up" scale dip taken just before a pop. */
export const ANTICIPATE_DIP = 0.92

/** A ready "pop in": a wind-up dip then an overshoot peak. Spread the result and add your own `normal` rest state. */
export function popIn({
  dip = ANTICIPATE_DIP,
  peak = 1.18,
  duration = DUR.slow,
}: { dip?: number; peak?: number; duration?: number } = {}): {
  scale: number[]
  transition: Transition
} {
  return {
    scale: [1, dip, peak, 1],
    transition: { duration, ease: ARRIVE, times: [0, 0.25, 0.6, 1] },
  }
}

type AnimationControls = ReturnType<typeof useAnimation>

export interface HoverController {
  controls: AnimationControls
  /** True when the icon should render its static fallback instead of animating. */
  reduced: boolean
  /** True when motion may repeat on its own (the replay loop below). */
  ambient: boolean
  start: () => void
  stop: () => void
  /** Spread onto the icon's wrapper. Keyboard focus triggers it too, not just pointer. */
  bind: Pick<DOMAttributes<Element>, 'onMouseEnter' | 'onMouseLeave' | 'onFocus' | 'onBlur'>
}

/**
 * The common-case hover controller: one `useAnimation` instance plus enter / leave /
 * focus / blur wiring, looping the "animate" variant while hovered/focused.
 */
export function useHover(): HoverController {
  const controls = useAnimation()
  const reduced = false
  const ambient = !(useReducedMotion() ?? false)

  const looping = useRef(false)
  const replayTimer = useRef<number | undefined>(undefined)

  const start = useCallback(() => {
    if (looping.current) return
    looping.current = true
    const run = () => {
      if (!looping.current) return
      const t0 = performance.now()
      void controls.start('animate').then(() => {
        if (!looping.current) return
        controls.set('normal')
        if (!ambient) {
          looping.current = false
          return
        }
        const elapsed = performance.now() - t0
        replayTimer.current = window.setTimeout(run, elapsed < 100 ? 300 : elapsed * 0.3)
      })
    }
    run()
  }, [controls, ambient])

  const stop = useCallback(() => {
    looping.current = false
    window.clearTimeout(replayTimer.current)
    void controls.start('normal')
  }, [controls])

  useEffect(
    () => () => {
      looping.current = false
      window.clearTimeout(replayTimer.current)
    },
    [],
  )

  return {
    controls,
    reduced,
    ambient,
    start,
    stop,
    bind: { onMouseEnter: start, onMouseLeave: stop, onFocus: start, onBlur: stop },
  }
}
