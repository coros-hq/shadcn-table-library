import { useEffect, useRef, useState } from 'react'
import type { Ref } from 'react'
import { Check, ChevronDown, ChevronUp, X } from 'lucide-react'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import { cn } from '#/lib/utils'
import type { Change } from './data'
import { diffLines, fieldLabel, keysOf, rowState } from './diff'
import type { Decision, Decisions } from './diff'

// A card that opens at the right of the table's frame and pushes the table
// aside, so the highlighted row stays in view next to its diff. No overlay:
// the table is still there to click another row.
export function DiffPanel({
  change,
  position,
  decisions,
  onDecide,
  onPrevious,
  onNext,
  onClose,
}: {
  /** The change being reviewed; the panel is closed while this is null */
  change: Change | null
  /** "3 of 11", for the change being reviewed */
  position: { index: number; total: number }
  decisions: Decisions
  /** Decides some of this change's keys. `advance` moves on to the next change to review. */
  onDecide: (
    keys: string[],
    decision: Decision | null,
    advance?: boolean,
  ) => void
  onPrevious: () => void
  onNext: () => void
  onClose: () => void
}) {
  // Keeps the last change on screen while the panel slides out
  const [shown, setShown] = useState(change)
  if (change && change !== shown) setShown(change)

  const open = change !== null
  const heading = useRef<HTMLHeadingElement>(null)
  const openId = change?.id
  const lastId = useRef(openId)
  // Moving focus to the heading tells screen readers which product is open.
  // On close, focus goes back to that product's row in the table.
  useEffect(() => {
    if (openId) heading.current?.focus()
    else if (lastId.current) {
      document
        .querySelector<HTMLElement>(`[data-review-id="${lastId.current}"]`)
        ?.focus()
    }
    lastId.current = openId
  }, [openId])

  return (
    <section
      aria-label="Review changes"
      aria-hidden={!open}
      inert={!open}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
      className={cn(
        'shrink-0 overflow-hidden bg-background duration-300 ease-out motion-reduce:transition-none max-sm:absolute max-sm:inset-y-0 max-sm:right-0 max-sm:z-20',
        // Pushes the table aside as it widens (on phones it covers it instead).
        // Visible at once when opening, so the heading can take focus; hidden
        // only after closing, so it can't be tabbed to while closed
        open
          ? 'visible w-full border-l transition-[width] sm:w-[26rem]'
          : 'invisible w-0 transition-[width,visibility]',
      )}
    >
      {/* A fixed width inside, so the content doesn't reflow while the panel widens */}
      <div className="flex h-full w-full flex-col sm:w-[26rem]">
        {shown ? (
          <DiffBody
            change={shown}
            position={position}
            decisions={decisions}
            onDecide={onDecide}
            onPrevious={onPrevious}
            onNext={onNext}
            onClose={onClose}
            headingRef={heading}
          />
        ) : null}
      </div>
    </section>
  )
}

function DiffBody({
  change,
  position,
  decisions,
  onDecide,
  onPrevious,
  onNext,
  onClose,
  headingRef,
}: Omit<Parameters<typeof DiffPanel>[0], 'change'> & {
  change: Change
  headingRef: Ref<HTMLHeadingElement>
}) {
  const product = change.kind === 'create' ? change.after : change.before
  const lines = diffLines(change)
  const keys = keysOf(change)
  const state = rowState(change, decisions)
  const pending = keys.filter((k) => !(k in decisions))
  // Several changes can be picked one by one; a single one is just the buttons
  const pickable = change.kind === 'update' && keys.length > 1
  const added = lines.filter((l) => l.kind === 'added').length
  const removed = lines.filter((l) => l.kind === 'removed').length
  const whole = change.kind === 'update' ? undefined : decisions[keys[0]]

  // Partly decided: the buttons finish the rest instead of overwriting picks
  const targets = state === 'partial' ? pending : keys
  const verb =
    change.kind === 'create'
      ? { accept: 'Add product', reject: 'Don’t add' }
      : change.kind === 'delete'
        ? { accept: 'Remove product', reject: 'Keep product' }
        : state === 'partial'
          ? { accept: 'Accept the rest', reject: 'Reject the rest' }
          : { accept: 'Accept changes', reject: 'Reject changes' }

  return (
    <>
      <header className="relative flex flex-col gap-1 border-b p-4 pr-12">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 size-7"
          aria-label="Close"
          onClick={onClose}
        >
          <X />
        </Button>
        <div className="flex items-center gap-2">
          <h3
            ref={headingRef}
            tabIndex={-1}
            className="font-semibold text-foreground outline-none"
          >
            {product.name}
          </h3>
          {change.kind === 'create' ? (
            <Badge
              variant="outline"
              className="border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
            >
              New
            </Badge>
          ) : change.kind === 'delete' ? (
            <Badge
              variant="outline"
              className="border-red-500/40 text-red-700 dark:text-red-400"
            >
              Removed
            </Badge>
          ) : null}
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono text-xs text-muted-foreground">
            {product.sku}
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="tabular-nums">
              {position.index + 1} of {position.total}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label="Previous product with changes"
              onClick={onPrevious}
            >
              <ChevronUp />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label="Next product with changes"
              onClick={onNext}
            >
              <ChevronDown />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="overflow-hidden rounded-md border font-mono text-xs">
          <div className="flex items-center justify-between border-b bg-muted/50 px-3 py-2 text-muted-foreground">
            <span>products/{product.sku}</span>
            <span>
              {added ? (
                <span className="text-emerald-700 dark:text-emerald-400">
                  +{added}
                </span>
              ) : null}{' '}
              {removed ? (
                <span className="text-red-700 dark:text-red-400">
                  −{removed}
                </span>
              ) : null}
            </span>
          </div>
          <table className="w-full border-collapse">
            <tbody>
              {lines.map((line, i) => {
                const decision =
                  line.kind !== 'context'
                    ? line.key
                      ? decisions[line.key]
                      : whole
                    : undefined
                // The side that won't be used fades once decided
                const dropped =
                  (line.kind === 'removed' && decision === 'accepted') ||
                  (line.kind === 'added' && decision === 'rejected')
                return (
                  <tr
                    key={i}
                    className={cn(
                      line.kind === 'added' &&
                        'bg-emerald-500/10 text-emerald-900 dark:text-emerald-200',
                      line.kind === 'removed' &&
                        'bg-red-500/10 text-red-900 dark:text-red-200',
                      line.kind === 'context' && 'text-muted-foreground',
                      dropped && 'opacity-40',
                    )}
                  >
                    {pickable ? (
                      <td className="w-8 pl-3 align-middle">
                        {line.kind === 'added' && line.key ? (
                          <Checkbox
                            className="bg-background"
                            checked={decisions[line.key] === 'accepted'}
                            onCheckedChange={(on) =>
                              onDecide(
                                [line.key!],
                                on === true ? 'accepted' : 'rejected',
                              )
                            }
                            aria-label={`Accept new ${fieldLabel[line.field].toLowerCase()}: ${line.value}`}
                          />
                        ) : null}
                      </td>
                    ) : null}
                    <td
                      aria-hidden
                      className="w-6 py-1.5 pl-3 text-center select-none"
                    >
                      {line.kind === 'added'
                        ? '+'
                        : line.kind === 'removed'
                          ? '−'
                          : ' '}
                    </td>
                    <td className="w-24 py-1.5 pr-2">
                      {fieldLabel[line.field]}
                    </td>
                    <td
                      className={cn(
                        'py-1.5 pr-3 break-words',
                        dropped && 'line-through',
                      )}
                    >
                      <span className="sr-only">
                        {line.kind === 'added'
                          ? 'New: '
                          : line.kind === 'removed'
                            ? 'Old: '
                            : 'Unchanged: '}
                      </span>
                      {line.value}
                      {line.kind === 'added' && line.moved ? (
                        <span className="ml-2 opacity-70">{line.moved}</span>
                      ) : null}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {pickable && state !== 'accepted' && state !== 'rejected' ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Tick the changes to keep, or decide them all at once below.
          </p>
        ) : null}
      </div>

      <footer className="flex items-center justify-end gap-2 border-t p-4">
        {state === 'pending' || state === 'partial' ? (
          <>
            {/* On phones the two share the row instead of wrapping */}
            <Button
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={() => onDecide(targets, 'rejected', true)}
            >
              <X /> {verb.reject}
            </Button>
            <Button
              className="flex-1 sm:flex-none"
              onClick={() => onDecide(targets, 'accepted', true)}
            >
              <Check /> {verb.accept}
            </Button>
          </>
        ) : (
          <>
            <span
              className={cn(
                'mr-auto text-sm',
                state === 'accepted'
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-muted-foreground',
              )}
            >
              {state === 'accepted'
                ? 'Accepted'
                : state === 'rejected'
                  ? 'Rejected'
                  : `${keys.filter((k) => decisions[k] === 'accepted').length} of ${keys.length} accepted`}
            </span>
            <Button variant="ghost" onClick={() => onDecide(keys, null)}>
              Undo
            </Button>
            <Button variant="outline" onClick={onNext}>
              Next <ChevronDown />
            </Button>
          </>
        )}
      </footer>
    </>
  )
}
