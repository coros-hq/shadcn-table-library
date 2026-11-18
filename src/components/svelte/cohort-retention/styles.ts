import { intensity } from './cohorts'

/** Diagonal lines for months a cohort hasn't reached; also in the legend */
export const hatch =
  'bg-[repeating-linear-gradient(135deg,color-mix(in_oklab,var(--muted-foreground)_30%,transparent)_0_1px,transparent_1px_5px)]'

/** The fill, one hue getting stronger with retention; --cohort is set on the table */
export const fill = (percent: number) =>
  `background-color: color-mix(in oklab, var(--cohort) ${Math.round(intensity(percent) * 100)}%, transparent)`

/** The one hue every retention cell is a shade of */
export const hue =
  '[--cohort:var(--color-blue-600)] dark:[--cohort:var(--color-blue-500)]'

export interface CohortMeta {
  mode: 'percent' | 'count'
  highlighted: string | null
  toggle: (id: string) => void
}
