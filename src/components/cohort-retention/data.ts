export interface Cohort {
  /** "2026-03" */
  id: string
  /** "Mar 2026" */
  label: string
  /** Users who signed up that month */
  size: number
  /**
   * Users still active in each month since signup, starting with month 0.
   * The list stops where the cohort hasn't reached the month yet: a missing
   * month is unknown, while 0 means nobody came back.
   */
  retained: number[]
}

/** Months since signup shown as columns: month 0 to month 11 */
export const PERIODS = 12

const labels = [
  'Dec',
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
]

// Deterministic, so the server and the browser render the same numbers
function random(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** A typical curve: a steep drop after month 0, then a slow decline */
const curve = [
  1, 0.44, 0.35, 0.3, 0.27, 0.25, 0.235, 0.22, 0.21, 0.2, 0.195, 0.19,
]
const sizes = [40, 610, 720, 680, 820, 900, 860, 940, 1010, 980, 1100, 1240]

function makeCohorts(): Cohort[] {
  const next = random(7)
  return sizes.map((size, i) => {
    const year = i === 0 ? 2025 : 2026
    const month = i === 0 ? 12 : i
    // Twelve monthly cohorts up to November 2026: the oldest has had all
    // twelve months, the newest only its first
    const reached = PERIODS - i
    let retained: number[]
    if (i === 0) {
      // The soft-launch cohort was small, and its last users left in
      // month 9: real zeros, not missing data
      retained = [40, 14, 9, 6, 4, 3, 2, 1, 1, 0, 0, 0]
    } else {
      // Later cohorts retain a little better as the product improves
      const lift = 0.92 + i * 0.022
      retained = []
      for (let k = 0; k < reached; k++) {
        if (k === 0) {
          retained.push(size)
          continue
        }
        const noise = 0.94 + next() * 0.12
        const n = Math.round(size * Math.min(1, curve[k] * lift * noise))
        retained.push(Math.min(n, retained[k - 1]))
      }
    }
    return {
      id: `${year}-${String(month).padStart(2, '0')}`,
      label: `${labels[i]} ${year}`,
      size,
      retained: retained.slice(0, reached),
    }
  })
}

export const cohorts = makeCohorts()
