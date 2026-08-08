'use client'

import { forwardRef, useImperativeHandle, useRef } from 'react'
import { animate, motion, useMotionValue, useReducedMotion } from 'motion/react'
import { ARRIVE } from '#/lib/animated-icon.ts'
import type { IconHandle, IconProps } from '#/lib/animated-icon.ts'

// PULSE — a spin about the centre carrying a squash-and-pop scale as secondary
// action, a tactile refresh tap. The glyph's 2-fold rotational symmetry lands a
// full 360° turn seamlessly back at rest.
const GLYPH =
  'M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h28.69L182.06,73.37a79.56,79.56,0,0,0-56.13-23.43h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27a96,96,0,0,1,135,.79L208,76.69V48a8,8,0,0,1,16,0ZM186.41,183.29a80,80,0,0,1-112.47-.66L59.31,168H88a8,8,0,0,0,0-16H40a8,8,0,0,0-8,8v48a8,8,0,0,0,16,0V179.31l14.63,14.63A95.43,95.43,0,0,0,130,222.06h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z'

export const ArrowsClockwiseIcon = forwardRef<IconHandle, IconProps>(function ArrowsClockwiseIcon(
  { size = 28, style, ...props },
  ref,
) {
  const reduced = useReducedMotion() ?? false
  const rotate = useMotionValue(0)
  const scale = useMotionValue(1)
  const rAnim = useRef<ReturnType<typeof animate> | null>(null)
  const sAnim = useRef<ReturnType<typeof animate> | null>(null)

  const start = () => {
    if (reduced) return
    rAnim.current?.stop()
    sAnim.current?.stop()
    rotate.set(0)
    scale.set(1)
    rAnim.current = animate(rotate, 360, { duration: 0.85, ease: ARRIVE })
    sAnim.current = animate(scale, [1, 0.9, 1.06, 1], { duration: 0.7, ease: 'easeOut', times: [0, 0.3, 0.65, 1] })
  }

  const stop = () => {
    rAnim.current?.stop()
    sAnim.current?.stop()
    rotate.set(0)
    scale.set(1)
  }

  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }))

  return (
    <div
      {...props}
      onMouseEnter={start}
      onMouseLeave={stop}
      onFocus={start}
      onBlur={stop}
      style={{ display: 'inline-flex', ...style }}
    >
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 256 256"
        fill="currentColor"
        style={{ rotate, scale, overflow: 'visible' }}
      >
        <path d={GLYPH} />
      </motion.svg>
    </div>
  )
})
