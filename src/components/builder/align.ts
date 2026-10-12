import type { Align } from './schema'

export const alignClass: Record<Align, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

export const justifyClass: Record<Align, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
}

/** Alignment is carried in a column's `meta` so TanStack stays untyped about it */
export const alignOf = (def: { meta?: unknown }): Align =>
  (def.meta as { align?: Align } | undefined)?.align ?? 'left'
