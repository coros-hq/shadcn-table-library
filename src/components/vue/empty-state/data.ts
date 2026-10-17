export type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue'

export type Invoice = {
  id: string
  customer: string
  email: string
  status: InvoiceStatus
  amount: number
  /** ISO date (YYYY-MM-DD) */
  dueDate: string
}

export const statuses: InvoiceStatus[] = ['Paid', 'Pending', 'Overdue']

export const invoices: Invoice[] = [
  {
    id: 'INV-1042',
    customer: 'Acme Corp',
    email: 'billing@acme.com',
    status: 'Paid',
    amount: 4200,
    dueDate: '2026-09-28',
  },
  {
    id: 'INV-1043',
    customer: 'Globex',
    email: 'ap@globex.io',
    status: 'Pending',
    amount: 1850,
    dueDate: '2026-10-20',
  },
  {
    id: 'INV-1044',
    customer: 'Initech',
    email: 'finance@initech.com',
    status: 'Overdue',
    amount: 9300,
    dueDate: '2026-09-02',
  },
  {
    id: 'INV-1045',
    customer: 'Umbrella Labs',
    email: 'accounts@umbrella.dev',
    status: 'Paid',
    amount: 640,
    dueDate: '2026-09-30',
  },
  {
    id: 'INV-1046',
    customer: 'Hooli',
    email: 'pay@hooli.com',
    status: 'Pending',
    amount: 12750,
    dueDate: '2026-10-25',
  },
  {
    id: 'INV-1047',
    customer: 'Stark Industries',
    email: 'ap@stark.co',
    status: 'Paid',
    amount: 28000,
    dueDate: '2026-10-01',
  },
  {
    id: 'INV-1048',
    customer: 'Wayne Enterprises',
    email: 'billing@wayne.com',
    status: 'Overdue',
    amount: 3150,
    dueDate: '2026-08-29',
  },
  {
    id: 'INV-1049',
    customer: 'Soylent',
    email: 'ar@soylent.net',
    status: 'Pending',
    amount: 920,
    dueDate: '2026-11-03',
  },
]

/** Stand-in for a network request; swap for your real fetch. */
export function fetchInvoices(delay = 1500): Promise<Invoice[]> {
  return new Promise((resolve) => setTimeout(() => resolve(invoices), delay))
}
