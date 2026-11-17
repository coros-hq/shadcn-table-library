// What an imported customer looks like. To import products instead, swap
// these fields: the review table, mapping and validation all read from here.

export type FieldId =
  'name' | 'email' | 'company' | 'country' | 'plan' | 'seats'

export interface Field {
  id: FieldId
  label: string
  required?: boolean
  /** CSV headers that map to this field automatically, lowercased */
  aliases: string[]
  /** Returns an error message, or null when the value is fine */
  validate: (value: string) => string | null
  /** The value that gets imported */
  normalize: (value: string) => string | number | null
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export const plans = ['Free', 'Pro', 'Enterprise'] as const

const text = (value: string) => value.trim() || null

export const fields: Field[] = [
  {
    id: 'name',
    label: 'Name',
    required: true,
    aliases: ['name', 'full name', 'customer', 'customer name', 'contact'],
    validate: (v) => (v.trim() ? null : 'Name is required'),
    normalize: text,
  },
  {
    id: 'email',
    label: 'Email',
    required: true,
    aliases: ['email', 'e mail', 'email address', 'e mail address', 'mail'],
    validate: (v) =>
      !v.trim()
        ? 'Email is required'
        : EMAIL.test(v.trim())
          ? null
          : 'Not a valid email address',
    normalize: (v) => v.trim().toLowerCase(),
  },
  {
    id: 'company',
    label: 'Company',
    aliases: ['company', 'organization', 'organisation', 'account', 'business'],
    validate: () => null,
    normalize: text,
  },
  {
    id: 'country',
    label: 'Country',
    aliases: ['country', 'country code'],
    validate: (v) =>
      !v.trim() || /^[a-z]{2}$/i.test(v.trim())
        ? null
        : 'Use a 2-letter country code, like US',
    normalize: (v) => v.trim().toUpperCase() || null,
  },
  {
    id: 'plan',
    label: 'Plan',
    required: true,
    aliases: ['plan', 'tier', 'subscription'],
    validate: (v) =>
      plans.some((p) => p.toLowerCase() === v.trim().toLowerCase())
        ? null
        : `Plan must be ${plans.join(', ').replace(/, (?=[^,]*$)/, ' or ')}`,
    normalize: (v) =>
      plans.find((p) => p.toLowerCase() === v.trim().toLowerCase()) ?? null,
  },
  {
    id: 'seats',
    label: 'Seats',
    aliases: ['seats', 'licenses', 'licences', 'users', 'quantity'],
    validate: (v) => {
      if (!v.trim()) return null
      const n = Number(v.trim().replace(/,/g, ''))
      return Number.isInteger(n) && n >= 1
        ? null
        : 'Seats must be a whole number of at least 1'
    },
    normalize: (v) => (v.trim() ? Number(v.trim().replace(/,/g, '')) : 1),
  },
]

export const fieldById = Object.fromEntries(
  fields.map((f) => [f.id, f]),
) as Record<FieldId, Field>

/** Emails that already belong to a customer in your workspace */
export const existingEmails = new Set(['ada@lovelace.dev', 'grace@navy.mil'])
