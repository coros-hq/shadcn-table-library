import Sortable from 'sortablejs'
import type { Attachment } from 'svelte/attachments'

type Options = {
  /** Called with the dragged row's old and new index in the rendered order */
  onMove: (oldIndex: number, newIndex: number) => void
}

/**
 * Svelte attachment that makes the children of a node draggable via their
 * `[data-drag-handle]`. SortableJS moves the DOM node itself, so we put it
 * back and let Svelte's keyed `{#each}` re-render the new order.
 */
export function sortable({ onMove }: Options): Attachment<HTMLElement> {
  return (node) => {
    const instance = Sortable.create(node, {
      handle: '[data-drag-handle]',
      animation: 150,
      onEnd({ item, from, oldIndex, newIndex }) {
        if (oldIndex === undefined || newIndex === undefined) return
        item.remove()
        from.insertBefore(item, from.children[oldIndex] ?? null)
        if (oldIndex !== newIndex) onMove(oldIndex, newIndex)
      },
    })
    return () => instance.destroy()
  }
}
