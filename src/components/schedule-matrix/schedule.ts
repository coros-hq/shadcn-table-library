import { covered, days, people, required, shiftById, shifts } from './data'
import type { Assignment, CoveredShift, Person, Schedule } from './data'

/** Fewer hours than this between two shifts breaks the rest rule */
export const MIN_REST = 11

export const cellKey = (personId: string, day: number) => `${personId}:${day}`

/** Sets one person's day, without touching the rest */
export function assign(
  schedule: Schedule,
  personId: string,
  day: number,
  value: Assignment,
): Schedule {
  if (schedule[personId][day] === value) return schedule
  const week = [...schedule[personId]]
  week[day] = value
  return { ...schedule, [personId]: week }
}

/** Scheduled hours in the week, leave included */
export const hours = (week: Assignment[]) =>
  week.reduce((sum, a) => sum + (a ? shiftById[a].hours : 0), 0)

/** How many people work each shift on a day */
export function coverage(schedule: Schedule, day: number) {
  const count = { early: 0, late: 0, night: 0 } as Record<CoveredShift, number>
  for (const person of people) {
    const a = schedule[person.id][day]
    if (a && a !== 'leave') count[a]++
  }
  return count
}

export interface Gap {
  day: number
  shift: CoveredShift
  have: number
  need: number
}

/** Every shift with fewer people than it needs */
export const gaps = (schedule: Schedule): Gap[] =>
  days.flatMap((d, day) => {
    const have = coverage(schedule, day)
    const need = required(d)
    return covered
      .filter((shift) => have[shift] < need[shift])
      .map((shift) => ({ day, shift, have: have[shift], need: need[shift] }))
  })

/**
 * Hours of rest before the shift on `day`, counted from the end of the
 * previous day's shift. Null when either day isn't a worked shift.
 */
export function restBefore(week: Assignment[], day: number): number | null {
  const prev = week[day - 1]
  const next = week[day]
  if (!prev || !next || prev === 'leave' || next === 'leave') return null
  return 24 + shiftById[next].start - shiftById[prev].end
}

export interface Conflict {
  personId: string
  day: number
  rest: number
}

/** Shifts that start too soon after the one before */
export const conflicts = (schedule: Schedule): Conflict[] =>
  people.flatMap((person) =>
    days.flatMap((_, day) => {
      const rest = restBefore(schedule[person.id], day)
      return rest !== null && rest < MIN_REST
        ? [{ personId: person.id, day, rest }]
        : []
    }),
  )

/** Hours against contract: under, on or over */
export function load(person: Person, week: Assignment[]) {
  const h = hours(week)
  return {
    hours: h,
    diff: h - person.contract,
    status:
      h > person.contract ? 'over' : h < person.contract ? 'under' : 'exact',
  } as const
}

/** Cells that differ from the published schedule */
export function changes(saved: Schedule, current: Schedule) {
  const changed = new Set<string>()
  for (const person of people) {
    current[person.id].forEach((a, day) => {
      if (saved[person.id][day] !== a) changed.add(cellKey(person.id, day))
    })
  }
  return changed
}

/** A typed key's assignment: a shift's letter, or Delete/Backspace for off */
export function fromKey(key: string): Assignment | undefined {
  if (key === 'Delete' || key === 'Backspace') return null
  return shifts.find((s) => s.code === key.toUpperCase())?.id
}
