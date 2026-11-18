export const categories = [
  'Travel',
  'Lodging',
  'Meals',
  'Software',
  'Office',
] as const
export type Category = (typeof categories)[number]

/** A saved expense */
export interface Expense {
  id: string
  /** "2026-11-04" */
  date: string
  description: string
  category: Category
  amount: number
}

/** The report covers one month; dates outside it are rejected */
export const period = { from: '2026-11-01', to: '2026-11-30' }
export const periodLabel = 'November 2026'

/** Fixed, rather than the real date, so the server and browser agree */
export const today = '2026-11-17'

export const saved: Expense[] = [
  {
    id: 'exp-1',
    date: '2026-11-03',
    description: 'Train to Lyon',
    category: 'Travel',
    amount: 86.4,
  },
  {
    id: 'exp-2',
    date: '2026-11-03',
    description: 'Hotel Bellecour, 2 nights',
    category: 'Lodging',
    amount: 312,
  },
  {
    id: 'exp-3',
    date: '2026-11-04',
    description: 'Client dinner',
    category: 'Meals',
    amount: 148.5,
  },
  {
    id: 'exp-4',
    date: '2026-11-10',
    description: 'Figma, annual seat',
    category: 'Software',
    amount: 180,
  },
]
