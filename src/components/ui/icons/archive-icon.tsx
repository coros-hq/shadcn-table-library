'use client'

import { forwardRef, useImperativeHandle } from 'react'
import { motion } from 'motion/react'
import type { Variants } from 'motion/react'
import { OVERSHOOT_BACK, RETURN_TRANSITION, useHover } from '#/lib/animated-icon.ts'
import type { IconHandle, IconProps } from '#/lib/animated-icon.ts'

// STASH — the lid lifts and tilts open on a left-edge hinge, a label drops into the
// box, then the lid swings shut with a small squash on impact.
const LID = 'M32,48H224a16,16,0,0,1,16,16V88a16,16,0,0,1-16,16H32a16,16,0,0,1-16-16V64A16,16,0,0,1,32,48ZM32,64H224V88H32Z'
const BOX = 'M32,104H224V192a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16ZM48,104H208V192H48Z'
const SLOT = 'M96,136a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H104A8,8,0,0,1,96,136Z'

const BOX_BOTTOM = { transformBox: 'view-box' as const, originX: 0.5, originY: 0.81 }
const LID_HINGE = { transformBox: 'view-box' as const, originX: 0.0625, originY: 0.406 }

const lid: Variants = {
  normal: { y: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -24, -24, 0, 0],
    rotate: [0, -10, -10, 0, 0],
    transition: { duration: 1.2, times: [0, 0.22, 0.58, 0.82, 1], ease: 'easeInOut' },
  },
}
const label: Variants = {
  normal: { y: 0, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [-26, -26, 0, 0],
    opacity: [0, 0, 1, 1],
    transition: { duration: 1.2, times: [0, 0.3, 0.58, 1], ease: OVERSHOOT_BACK },
  },
}
const box: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 1, 0.93, 1.02, 1],
    transition: { duration: 1.2, times: [0, 0.78, 0.86, 0.94, 1], ease: 'easeOut' },
  },
}

export const ArchiveIcon = forwardRef<IconHandle, IconProps>(function ArchiveIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover()
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop])

  return (
    <div {...props} {...bind} style={{ display: 'inline-flex', overflow: 'hidden', ...style }}>
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 256 256"
        fill="currentColor"
        initial="normal"
        animate={controls}
        style={{ overflow: 'visible' }}
      >
        <motion.g variants={reduced ? undefined : box} style={BOX_BOTTOM}>
          <path d={BOX} fillRule="evenodd" />
        </motion.g>
        <motion.path d={SLOT} variants={reduced ? undefined : label} />
        <motion.path d={LID} fillRule="evenodd" variants={reduced ? undefined : lid} style={LID_HINGE} />
      </motion.svg>
    </div>
  )
})
