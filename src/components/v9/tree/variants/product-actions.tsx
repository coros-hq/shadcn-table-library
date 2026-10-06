'use client'

import { useState } from 'react'
import { Bell, Plus } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils.ts'

interface ProductActionsProps {
  name: string
}

export function ProductActions({ name }: ProductActionsProps) {
  const [added, setAdded] = useState(false)
  const [watching, setWatching] = useState(false)

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-pressed={added}
        aria-label={`${added ? 'Remove' : 'Add'} ${name} ${added ? 'from' : 'to'} the purchase order`}
        onClick={() => setAdded((value) => !value)}
        className={cn(
          'size-7 rounded-full text-amber-600 hover:text-amber-600 dark:text-amber-400',
          added && 'border-amber-500 bg-amber-500/10',
        )}
      >
        <Plus
          className={cn('size-4 transition-transform', added && 'rotate-45')}
        />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-pressed={watching}
        aria-label={`${watching ? 'Stop watching' : 'Watch'} stock of ${name}`}
        onClick={() => setWatching((value) => !value)}
        className="size-7 text-amber-600 hover:text-amber-600 dark:text-amber-400"
      >
        <Bell className={cn('size-4', watching && 'fill-current')} />
      </Button>
    </div>
  )
}
