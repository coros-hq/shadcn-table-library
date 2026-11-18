import type { Assignment, ShiftId } from './data'
import { shifts } from './data'

/** Each shift's color, shared by the cells, the legend and the footer */
export const shiftTone: Record<ShiftId, string> = {
  early: 'bg-sky-100 text-sky-900 dark:bg-sky-500/20 dark:text-sky-200',
  late: 'bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200',
  night:
    'bg-violet-100 text-violet-900 dark:bg-violet-500/25 dark:text-violet-200',
  leave:
    'bg-[repeating-linear-gradient(135deg,var(--muted)_0_4px,transparent_4px_8px)] text-muted-foreground',
}

/** What the cell's popover offers: every shift, then Off */
export const options: { value: Assignment; label: string; time: string }[] = [
  ...shifts.map((s) => ({ value: s.id, label: s.label, time: s.time })),
  { value: null, label: 'Off', time: 'Not working' },
]
