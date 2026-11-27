import Ban from '@lucide/svelte/icons/ban'
import CircleAlert from '@lucide/svelte/icons/circle-alert'
import CircleCheck from '@lucide/svelte/icons/circle-check'
import Clock from '@lucide/svelte/icons/clock'
import LoaderCircle from '@lucide/svelte/icons/loader-circle'
import RotateCw from '@lucide/svelte/icons/rotate-cw'
import type { JobStatus } from './data'

/** Label, icon and colors for each status, shared by the badge and the bar */
export const statusStyle: Record<
  JobStatus,
  { label: string; icon: typeof Clock; badge: string; bar: string }
> = {
  queued: {
    label: 'Queued',
    icon: Clock,
    badge: 'text-muted-foreground',
    bar: 'bg-muted-foreground/40',
  },
  running: {
    label: 'Running',
    icon: LoaderCircle,
    badge: 'border-sky-500/40 text-sky-700 dark:text-sky-400',
    bar: 'bg-sky-500',
  },
  retrying: {
    label: 'Retrying',
    icon: RotateCw,
    badge: 'border-amber-500/50 text-amber-800 dark:text-amber-300',
    bar: 'bg-amber-500',
  },
  succeeded: {
    label: 'Succeeded',
    icon: CircleCheck,
    badge: 'border-emerald-500/40 text-emerald-700 dark:text-emerald-400',
    bar: 'bg-emerald-500',
  },
  failed: {
    label: 'Failed',
    icon: CircleAlert,
    badge: 'border-destructive/40 text-destructive',
    bar: 'bg-destructive',
  },
  canceled: {
    label: 'Canceled',
    icon: Ban,
    badge: 'text-muted-foreground',
    bar: 'bg-muted-foreground/40',
  },
}
