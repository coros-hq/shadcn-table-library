import { COLS, ROW_COUNT } from './formula'

const filled: string[][] = [
  ['Category', 'Jan', 'Feb', 'Mar', 'Total', 'Avg'],
  ['Rent', '1800', '1800', '1800', '=SUM(B2:D2)', '=AVERAGE(B2:D2)'],
  ['Groceries', '420', '465.5', '398', '=SUM(B3:D3)', '=AVERAGE(B3:D3)'],
  ['Transport', '85', '85', '120', '=SUM(B4:D4)', '=AVERAGE(B4:D4)'],
  ['Utilities', '140', '155', '132', '=SUM(B5:D5)', '=AVERAGE(B5:D5)'],
  ['Subscriptions', '48', '48', '63', '=SUM(B6:D6)', '=AVERAGE(B6:D6)'],
  [
    'Total',
    '=SUM(B2:B6)',
    '=SUM(C2:C6)',
    '=SUM(D2:D6)',
    '=SUM(E2:E6)',
    '=AVERAGE(F2:F6)',
  ],
  ['Income', '3200', '3200', '3350', '=SUM(B8:D8)', '=AVERAGE(B8:D8)'],
  ['Saved', '=B8-B7', '=C8-C7', '=D8-D7', '=SUM(B9:D9)', '=E9/E8'],
]

/** A fresh copy of the starting sheet: every cell is a raw string, as typed */
export function initialSheet(): string[][] {
  return Array.from({ length: ROW_COUNT }, (_, r) =>
    COLS.map((_col, c) => filled[r]?.[c] ?? ''),
  )
}
