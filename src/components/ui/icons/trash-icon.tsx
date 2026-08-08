'use client'

import { forwardRef, useImperativeHandle } from 'react'
import { motion } from 'motion/react'
import type { Variants } from 'motion/react'
import { RETURN_TRANSITION, useHover } from '#/lib/animated-icon.ts'
import type { IconHandle, IconProps } from '#/lib/animated-icon.ts'

// One-shot "toss": the lid swings up on its left hinge and lifts clear of the rim,
// then drops back down with a small bounce.
const lid: Variants = {
  normal: { rotate: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -22, 7, -3, 0],
    y: [0, -10, 2, -1, 0],
    transition: { duration: 0.7, ease: 'easeInOut', times: [0, 0.32, 0.62, 0.82, 1] },
  },
}

export const TrashIcon = forwardRef<IconHandle, IconProps>(function TrashIcon(
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
        fill="none"
        stroke="currentColor"
        strokeWidth={18}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial="normal"
        animate={controls}
        style={{ overflow: 'visible' }}
      >
        {/* can body: rounded-bottom bin that tapers in, with two vertical ribs */}
        <path d="M74 92l7 110a16 16 0 0 0 16 15h62a16 16 0 0 0 16-15l7-110" />
        <path d="M112 120v72" />
        <path d="M144 120v72" />
        {/* lid: rim bar + small handle, hinges and lifts from its left end */}
        <motion.g
          variants={reduced ? undefined : lid}
          style={{ transformBox: 'view-box', transformOrigin: '56px 70px' }}
        >
          <path d="M56 70h144" />
          <path d="M104 70V58a10 10 0 0 1 10-10h28a10 10 0 0 1 10 10v12" />
        </motion.g>
      </motion.svg>
    </div>
  )
})
