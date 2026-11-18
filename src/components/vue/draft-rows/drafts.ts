import { categories, period, today } from './data'
import type { Category, Expense } from './data'

/** A row being typed: every field is still the raw text from its input */
export interface Draft {
  id: string
  date: string
  description: string
  category: Category | ''
  amount: string
}

export type Field = 'date' | 'description' | 'category' | 'amount'
export const fields: Field[] = ['date', 'description', 'category', 'amount']

export type Errors = Partial<Record<Field, string>>

/** Per-expense limit before it needs a manager's approval */
export const LIMIT = 2_000

/** A new row starts on the date of the row above, which is usually right */
export const emptyDraft = (id: string, after?: Draft): Draft => ({
  id,
  date: after?.date || today,
  description: '',
  category: '',
  amount: '',
})

/** A row nobody typed in: saving skips it instead of failing on it */
export const isBlank = (d: Draft) =>
  !d.description.trim() && !d.category && !d.amount.trim()

/** "1,234.50" or "$12" become numbers; anything else is NaN */
export const parseAmount = (raw: string) =>
  raw.trim() === '' ? NaN : Number(raw.replace(/[$,\s]/g, ''))

export function validate(d: Draft): Errors {
  const errors: Errors = {}
  if (!d.date) errors.date = 'Pick a date'
  else if (d.date < period.from || d.date > period.to)
    errors.date = 'Must be in November 2026'
  else if (d.date > today) errors.date = "Can't be in the future"

  if (!d.description.trim()) errors.description = 'Describe the expense'
  else if (d.description.trim().length > 60)
    errors.description = '60 characters at most'

  if (!d.category) errors.category = 'Pick a category'
  else if (!categories.includes(d.category))
    errors.category = 'Unknown category'

  const amount = parseAmount(d.amount)
  if (d.amount.trim() === '') errors.amount = 'Enter an amount'
  else if (Number.isNaN(amount)) errors.amount = 'Numbers only'
  else if (amount <= 0) errors.amount = 'More than 0'
  else if (/\.\d{3,}$/.test(d.amount.trim())) errors.amount = 'Cents at most'
  else if (amount > LIMIT) errors.amount = `Over the $${LIMIT} limit`
  return errors
}

const signature = (date: string, amount: number, description: string) =>
  `${date}|${amount.toFixed(2)}|${description.trim().toLowerCase()}`

/**
 * Drafts that look like an expense already saved, or like another draft:
 * same date, amount and description. A warning, not an error, since two
 * identical taxi rides on one day can be real.
 */
export function duplicates(drafts: Draft[], existing: Expense[]) {
  const seen = new Set(
    existing.map((e) => signature(e.date, e.amount, e.description)),
  )
  const dupes = new Set<string>()
  for (const d of drafts) {
    const amount = parseAmount(d.amount)
    if (isBlank(d) || Number.isNaN(amount)) continue
    const sig = signature(d.date, amount, d.description)
    if (seen.has(sig)) dupes.add(d.id)
    seen.add(sig)
  }
  return dupes
}

export interface Batch {
  /** Drafts with something typed in */
  filled: Draft[]
  /** Filled drafts that can't be saved yet */
  invalid: Draft[]
  /** Sum of the amounts that parse */
  total: number
}

export function batch(drafts: Draft[]): Batch {
  const filled = drafts.filter((d) => !isBlank(d))
  const invalid = filled.filter((d) => Object.keys(validate(d)).length > 0)
  const total = filled.reduce((sum, d) => {
    const n = parseAmount(d.amount)
    return Number.isNaN(n) ? sum : sum + n
  }, 0)
  return { filled, invalid, total }
}

export const toExpense = (d: Draft, id: string): Expense => ({
  id,
  date: d.date,
  description: d.description.trim(),
  category: d.category as Category,
  amount: parseAmount(d.amount),
})

export const money = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

const monthDay = [
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
  'Dec',
]

/** "2026-11-04" → "Nov 4", without Date, so time zones can't shift it */
export const formatDate = (iso: string) => {
  const [, m, d] = iso.split('-').map(Number)
  return `${monthDay[m - 1]} ${d}`
}
