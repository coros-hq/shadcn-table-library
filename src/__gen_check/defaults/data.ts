export type Row = {
  id: string
  name: string
  status: string
  budget: number
  due: string
  done: boolean
}

// Sample data. Replace it with your own rows (or a fetch) of the same shape.
export const rows: Row[] = [
  {
    id: '1',
    name: 'Website redesign',
    status: 'In progress',
    budget: 7602,
    due: '2025-10-13',
    done: true,
  },
  {
    id: '2',
    name: 'Q3 campaign',
    status: 'Todo',
    budget: 4877,
    due: '2025-03-17',
    done: false,
  },
  {
    id: '3',
    name: 'Onboarding flow',
    status: 'Done',
    budget: 2152,
    due: '2025-08-19',
    done: false,
  },
  {
    id: '4',
    name: 'Billing migration',
    status: 'In progress',
    budget: 9327,
    due: '2025-01-21',
    done: true,
  },
  {
    id: '5',
    name: 'Mobile app',
    status: 'Todo',
    budget: 6602,
    due: '2025-06-25',
    done: false,
  },
  {
    id: '6',
    name: 'Help center',
    status: 'Done',
    budget: 3877,
    due: '2025-11-27',
    done: false,
  },
  {
    id: '7',
    name: 'Pricing page',
    status: 'In progress',
    budget: 1152,
    due: '2025-05-01',
    done: true,
  },
  {
    id: '8',
    name: 'Data pipeline',
    status: 'Todo',
    budget: 8327,
    due: '2025-10-03',
    done: false,
  },
  {
    id: '9',
    name: 'Brand refresh',
    status: 'Done',
    budget: 5602,
    due: '2025-03-07',
    done: false,
  },
  {
    id: '10',
    name: 'Partner portal',
    status: 'In progress',
    budget: 2877,
    due: '2025-08-09',
    done: true,
  },
  {
    id: '11',
    name: 'Search upgrade',
    status: 'Todo',
    budget: 152,
    due: '2025-01-11',
    done: false,
  },
  {
    id: '12',
    name: 'Accessibility audit',
    status: 'Done',
    budget: 7327,
    due: '2025-06-15',
    done: false,
  },
]
