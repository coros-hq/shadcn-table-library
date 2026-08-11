'use client'

import { useEffect, useState } from 'react'

const LABELS = ['live', 'sortable', 'filterable', 'searchable']

export function LiveStatusLabel() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % LABELS.length)
    }, 2400)
    return () => window.clearInterval(id)
  }, [])

  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
      <span className="relative flex size-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
        <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
      </span>
      <span key={index} className="animate-in fade-in duration-300">
        {LABELS[index]}
      </span>
    </span>
  )
}
