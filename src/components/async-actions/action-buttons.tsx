'use client'

import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { ArchiveIcon } from '#/components/ui/icons/archive-icon.tsx'
import { ArrowsClockwiseIcon } from '#/components/ui/icons/arrows-clockwise-icon.tsx'
import { TrashIcon } from '#/components/ui/icons/trash-icon.tsx'
import type { IconHandle } from '#/lib/animated-icon.ts'
import { cn } from '#/lib/utils.ts'

const base =
  'inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-sm text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none'

/**
 * The button, not the icon, owns the animation. Icons get pointer-events-none
 * so their own hover handlers can't stop a spin that a pending request started.
 */
function hoverHandlers(ref: RefObject<IconHandle | null>, locked = false) {
  const start = () => ref.current?.startAnimation()
  const stop = () => {
    if (!locked) ref.current?.stopAnimation()
  }
  return {
    onMouseEnter: start,
    onFocus: start,
    onMouseLeave: stop,
    onBlur: stop,
  }
}

export function SyncButton({
  status,
  onSync,
}: {
  status: 'synced' | 'syncing' | 'failed'
  onSync: () => void
}) {
  const icon = useRef<IconHandle>(null)
  const syncing = status === 'syncing'

  // The refresh icon spins once per start, so re-trigger it for as long as
  // the request is pending.
  useEffect(() => {
    if (!syncing) return
    icon.current?.startAnimation()
    const id = window.setInterval(() => icon.current?.startAnimation(), 900)
    return () => {
      window.clearInterval(id)
      icon.current?.stopAnimation()
    }
  }, [syncing])

  return (
    <button
      type="button"
      onClick={onSync}
      disabled={syncing}
      aria-busy={syncing}
      className={cn(base, 'w-24', syncing && 'text-foreground')}
      {...hoverHandlers(icon, syncing)}
    >
      <ArrowsClockwiseIcon
        ref={icon}
        size={16}
        className="pointer-events-none"
      />
      {syncing ? 'Syncing…' : status === 'failed' ? 'Retry' : 'Sync'}
    </button>
  )
}

export function ArchiveButton({
  name,
  disabled,
  concealed,
  onArchive,
}: {
  name: string
  disabled?: boolean
  /** Hidden (but still taking space) while Delete asks for confirmation */
  concealed?: boolean
  onArchive: () => void
}) {
  const icon = useRef<IconHandle>(null)
  return (
    <button
      type="button"
      aria-label={`Archive ${name}`}
      title="Archive"
      disabled={disabled}
      onClick={() => {
        icon.current?.startAnimation()
        onArchive()
      }}
      aria-hidden={concealed}
      tabIndex={concealed ? -1 : undefined}
      className={cn(
        base,
        'w-8 justify-center px-0 disabled:opacity-40',
        concealed && 'invisible',
      )}
      {...hoverHandlers(icon)}
    >
      <ArchiveIcon ref={icon} size={16} className="pointer-events-none" />
    </button>
  )
}

export function DeleteButton({
  name,
  confirming,
  disabled,
  onRequest,
  onConfirm,
  onCancel,
}: {
  name: string
  confirming: boolean
  disabled?: boolean
  onRequest: () => void
  onConfirm: () => void
  onCancel: () => void
}) {
  const icon = useRef<IconHandle>(null)
  const button = useRef<HTMLButtonElement>(null)
  // Latest onCancel without re-running the effect when the parent re-renders
  const cancel = useRef(onCancel)
  cancel.current = onCancel

  // While waiting for the second click: keep the lid moving, and cancel on
  // Escape or a click anywhere else. Listening on the document works even
  // when the click didn't focus the button (Safari and Firefox on macOS).
  useEffect(() => {
    if (!confirming) return
    icon.current?.startAnimation()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cancel.current()
    }
    const onPointerDown = (e: PointerEvent) => {
      if (!button.current?.contains(e.target as Node)) cancel.current()
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
      icon.current?.stopAnimation()
    }
  }, [confirming])

  // A fixed slot: the Confirm state grows leftward over the Archive slot
  // instead of pushing the other actions around.
  return (
    <div className="relative size-8 shrink-0">
      <button
        ref={button}
        type="button"
        aria-label={confirming ? `Confirm delete ${name}` : `Delete ${name}`}
        title={confirming ? 'Click again to delete' : 'Delete'}
        disabled={disabled}
        onClick={confirming ? onConfirm : onRequest}
        className={cn(
          base,
          'absolute top-0 right-0 justify-center disabled:opacity-40',
          confirming
            ? 'bg-destructive/10 text-destructive hover:bg-destructive/15 hover:text-destructive'
            : 'w-8 px-0 hover:bg-destructive/10 hover:text-destructive',
        )}
        {...hoverHandlers(icon, confirming)}
      >
        <TrashIcon ref={icon} size={16} className="pointer-events-none" />
        {confirming && 'Confirm'}
      </button>
    </div>
  )
}
