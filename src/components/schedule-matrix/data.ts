export type ShiftId = 'early' | 'late' | 'night' | 'leave'

/** What fills one person's day: a shift, leave, or nothing (off) */
export type Assignment = ShiftId | null

export interface Shift {
  id: ShiftId
  label: string
  /** One letter, shown in the cell and typed to assign it */
  code: string
  time: string
  /** Start and end in hours from midnight of the shift's own day */
  start: number
  end: number
  /** Paid hours. Leave counts toward the contract but covers nothing. */
  hours: number
}

export const shifts: Shift[] = [
  {
    id: 'early',
    label: 'Early',
    code: 'E',
    time: '06:00–14:00',
    start: 6,
    end: 14,
    hours: 8,
  },
  {
    id: 'late',
    label: 'Late',
    code: 'L',
    time: '14:00–22:00',
    start: 14,
    end: 22,
    hours: 8,
  },
  {
    id: 'night',
    label: 'Night',
    code: 'N',
    time: '22:00–06:00',
    start: 22,
    end: 30,
    hours: 8,
  },
  {
    id: 'leave',
    label: 'Leave',
    code: 'A',
    time: 'Annual leave',
    start: 0,
    end: 0,
    hours: 8,
  },
]

export const shiftById = Object.fromEntries(
  shifts.map((s) => [s.id, s]),
) as Record<ShiftId, Shift>

/** The shifts a ward has to staff, in order */
export const covered = ['early', 'late', 'night'] as const
export type CoveredShift = (typeof covered)[number]

export interface Day {
  id: string
  /** "Mon" */
  short: string
  /** "23" */
  date: string
  weekend: boolean
}

// Fixed strings, not Date formatting, so the server and browser agree
export const days: Day[] = [
  { id: 'mon', short: 'Mon', date: '23', weekend: false },
  { id: 'tue', short: 'Tue', date: '24', weekend: false },
  { id: 'wed', short: 'Wed', date: '25', weekend: false },
  { id: 'thu', short: 'Thu', date: '26', weekend: false },
  { id: 'fri', short: 'Fri', date: '27', weekend: false },
  { id: 'sat', short: 'Sat', date: '28', weekend: true },
  { id: 'sun', short: 'Sun', date: '29', weekend: true },
]

export const weekLabel = '23–29 November 2026'

/** Minimum people on each shift: two on weekdays, one at weekends */
export const required = (day: Day): Record<CoveredShift, number> =>
  day.weekend
    ? { early: 1, late: 1, night: 1 }
    : { early: 2, late: 2, night: 1 }

export interface Person {
  id: string
  name: string
  role: string
  /** Contracted hours per week */
  contract: number
}

export const people: Person[] = [
  { id: 'amara', name: 'Amara Okafor', role: 'Charge nurse', contract: 40 },
  { id: 'luis', name: 'Luis Herrera', role: 'Nurse', contract: 40 },
  { id: 'hana', name: 'Hana Sato', role: 'Nurse', contract: 24 },
  { id: 'tom', name: 'Tom Becker', role: 'Nurse', contract: 40 },
  { id: 'priya', name: 'Priya Nair', role: 'Nurse', contract: 24 },
  { id: 'jonas', name: 'Jonas Lind', role: 'Care assistant', contract: 40 },
  { id: 'chloe', name: 'Chloe Martin', role: 'Care assistant', contract: 40 },
  { id: 'sam', name: 'Sam Reyes', role: 'Care assistant', contract: 32 },
]

/** Each person's week, Monday to Sunday */
export type Schedule = Record<string, Assignment[]>

const E = 'early'
const L = 'late'
const N = 'night'
const A = 'leave'
const _ = null

/**
 * A draft with problems left in on purpose: Monday is one short on the late
 * shift and Saturday has nobody on it, Tom goes from a late straight into an
 * early (8h rest), and Jonas is booked 8h over his contract. Tom has the
 * hours to cover Saturday.
 */
export const draft: Schedule = {
  amara: [E, E, E, E, E, _, _],
  luis: [L, _, L, L, _, E, E],
  hana: [_, E, _, E, E, _, _],
  tom: [_, L, E, _, L, _, _],
  priya: [N, N, N, _, _, _, _],
  jonas: [E, L, L, L, L, _, L],
  chloe: [A, A, A, A, A, _, _],
  sam: [_, _, _, N, N, N, N],
}
