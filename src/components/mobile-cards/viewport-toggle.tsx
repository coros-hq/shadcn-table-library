'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { Tabs, TabsList, TabsTrigger } from '#/components/ui/tabs.tsx'

type View = 'mobile' | 'desktop'

const MOBILE_WIDTH = 375
// Comfortably past the table's 768px container-query threshold. This is a
// min-width, not a width — the preview pane itself is often narrower than
// 768px once the docs sidebar is accounted for, so "Desktop" has to force
// the simulated width (with horizontal scroll if needed) rather than just
// taking whatever room happens to be available, the same way a browser's
// device toolbar forces its simulated viewport.
const DESKTOP_MIN_WIDTH = 900

export function ViewportToggle({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>('desktop')

  return (
    <div>
      <Tabs
        value={view}
        onValueChange={(value) => setView(value as View)}
        className="mb-3"
      >
        <TabsList>
          <TabsTrigger value="mobile">Mobile</TabsTrigger>
          <TabsTrigger value="desktop">Desktop</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="overflow-x-auto">
        <div
          className="mx-auto"
          style={
            view === 'mobile'
              ? { width: MOBILE_WIDTH, maxWidth: '100%' }
              : { minWidth: DESKTOP_MIN_WIDTH }
          }
        >
          {children}
        </div>
      </div>
    </div>
  )
}
