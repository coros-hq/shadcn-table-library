import { columns, type Employee } from './columns'
import { DataTable } from './data-table'

const data: Employee[] = [
  { id: '1', name: 'Ava Thompson', email: 'ava.t@acme.dev', department: 'Engineering', role: 'Staff Engineer', location: 'Remote — US', manager: 'Grace Coleman', startDate: '2019-03-11', salary: '$182,000', status: 'Active' },
  { id: '2', name: 'Liam Chen', email: 'liam.chen@acme.dev', department: 'Design', role: 'Product Designer', location: 'New York, NY', manager: 'Sofia Reyes', startDate: '2021-07-02', salary: '$134,000', status: 'Active' },
  { id: '3', name: 'Sofia Patel', email: 'sofia.p@acme.dev', department: 'Product', role: 'PM II', location: 'Remote — EU', manager: 'Noah Park', startDate: '2020-01-20', salary: '$151,000', status: 'On leave' },
  { id: '4', name: 'Noah Garcia', email: 'noah.g@acme.dev', department: 'Engineering', role: 'Eng Manager', location: 'Austin, TX', manager: 'Ava Thompson', startDate: '2018-09-14', salary: '$196,000', status: 'Active' },
  { id: '5', name: 'Mia Johnson', email: 'mia.j@acme.dev', department: 'Support', role: 'Support Lead', location: 'Remote — US', manager: 'Ethan Kim', startDate: '2022-02-08', salary: '$98,000', status: 'Active' },
  { id: '6', name: 'Ethan Kim', email: 'ethan.kim@acme.dev', department: 'Support', role: 'Director, Support', location: 'Seattle, WA', manager: 'Grace Coleman', startDate: '2017-05-30', salary: '$168,000', status: 'Inactive' },
  { id: '7', name: 'Isabella Rossi', email: 'isabella.r@acme.dev', department: 'Design', role: 'Design Systems Lead', location: 'Remote — EU', manager: 'Liam Chen', startDate: '2020-11-16', salary: '$145,000', status: 'Active' },
  { id: '8', name: 'Lucas Martin', email: 'lucas.m@acme.dev', department: 'Sales', role: 'Account Executive', location: 'Chicago, IL', manager: 'Charlotte Diaz', startDate: '2021-04-05', salary: '$112,000', status: 'Active' },
  { id: '9', name: 'Amelia Novak', email: 'amelia.n@acme.dev', department: 'Engineering', role: 'Senior Engineer', location: 'Remote — US', manager: 'Noah Garcia', startDate: '2019-12-01', salary: '$165,000', status: 'Active' },
  { id: '10', name: 'Mason Lee', email: 'mason.lee@acme.dev', department: 'Product', role: 'Senior PM', location: 'San Francisco, CA', manager: 'Sofia Patel', startDate: '2018-06-18', salary: '$174,000', status: 'On leave' },
]

export function ColumnPinningTableDemo() {
  return (
    <DataTable
      columns={columns}
      data={data}
      initialPinning={{ left: ['name'], right: ['status'] }}
    />
  )
}
