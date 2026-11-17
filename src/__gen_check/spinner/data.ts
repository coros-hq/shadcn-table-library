export type Row = {
  id: string
  name: string
  status: string
  budget: number
  due: string
  done: boolean
  note: string
}

// Sample data. Replace it with your own rows (or a fetch) of the same shape.
export const rows: Row[] = [
  {
    id: '1',
    name: 'Website redesign',
    status: 'B\'s',
    budget: 7602,
    due: '2025-10-13',
    done: true,
    note: 'Q3 campaign',
  },
  {
    id: '2',
    name: 'Q3 campaign',
    status: 'A',
    budget: 4877,
    due: '2025-03-17',
    done: false,
    note: 'Onboarding flow',
  },
  {
    id: '3',
    name: 'Onboarding flow',
    status: 'B\'s',
    budget: 2152,
    due: '2025-08-19',
    done: false,
    note: 'Billing migration',
  },
  {
    id: '4',
    name: 'Billing migration',
    status: 'A',
    budget: 9327,
    due: '2025-01-21',
    done: true,
    note: 'Mobile app',
  },
  {
    id: '5',
    name: 'Mobile app',
    status: 'B\'s',
    budget: 6602,
    due: '2025-06-25',
    done: false,
    note: 'Help center',
  },
  {
    id: '6',
    name: 'Help center',
    status: 'A',
    budget: 3877,
    due: '2025-11-27',
    done: false,
    note: 'Pricing page',
  },
  {
    id: '7',
    name: 'Pricing page',
    status: 'B\'s',
    budget: 1152,
    due: '2025-05-01',
    done: true,
    note: 'Data pipeline',
  },
  {
    id: '8',
    name: 'Data pipeline',
    status: 'A',
    budget: 8327,
    due: '2025-10-03',
    done: false,
    note: 'Brand refresh',
  },
  {
    id: '9',
    name: 'Brand refresh',
    status: 'B\'s',
    budget: 5602,
    due: '2025-03-07',
    done: false,
    note: 'Partner portal',
  },
  {
    id: '10',
    name: 'Partner portal',
    status: 'A',
    budget: 2877,
    due: '2025-08-09',
    done: true,
    note: 'Search upgrade',
  },
  {
    id: '11',
    name: 'Search upgrade',
    status: 'B\'s',
    budget: 152,
    due: '2025-01-11',
    done: false,
    note: 'Accessibility audit',
  },
  {
    id: '12',
    name: 'Accessibility audit',
    status: 'A',
    budget: 7327,
    due: '2025-06-15',
    done: false,
    note: 'Website redesign',
  },
]
