export type Department =
  | 'Engineering'
  | 'Design'
  | 'Sales'
  | 'Marketing'
  | 'Finance'
  | 'People Ops'
  | 'Support'

export type EmployeeStatus = 'Active' | 'Remote' | 'On leave' | 'Probation'

export type Employee = {
  id: string
  name: string
  email: string
  role: string
  department: Department
  status: EmployeeStatus
  location: string
  manager: string
  /** ISO date (YYYY-MM-DD) */
  hireDate: string
  salary: number
  /** 1–5 */
  performance: number
}

export const departments: Department[] = [
  'Engineering',
  'Design',
  'Sales',
  'Marketing',
  'Finance',
  'People Ops',
  'Support',
]

export const statuses: EmployeeStatus[] = [
  'Active',
  'Remote',
  'On leave',
  'Probation',
]

const roles: Record<Department, string[]> = {
  Engineering: [
    'Staff Engineer',
    'Frontend Engineer',
    'Backend Engineer',
    'Engineering Manager',
  ],
  Design: ['Product Designer', 'Design Lead', 'UX Researcher'],
  Sales: ['Account Executive', 'Sales Development Rep', 'Sales Director'],
  Marketing: ['Content Strategist', 'Growth Marketer', 'Brand Manager'],
  Finance: ['Financial Analyst', 'Controller', 'Payroll Specialist'],
  'People Ops': ['Recruiter', 'HR Business Partner', 'People Ops Lead'],
  Support: ['Support Specialist', 'Customer Success Manager', 'Support Lead'],
}

const baseSalary: Record<Department, number> = {
  Engineering: 118000,
  Design: 98000,
  Sales: 86000,
  Marketing: 82000,
  Finance: 90000,
  'People Ops': 78000,
  Support: 64000,
}

const managers: Record<Department, string> = {
  Engineering: 'Priya Raman',
  Design: 'Tomás Vidal',
  Sales: 'Hannah Becker',
  Marketing: 'Idris Okafor',
  Finance: 'Mei Lin',
  'People Ops': 'Sofia Marchetti',
  Support: 'Daniel Osei',
}

const locations = [
  'San Francisco, US',
  'New York, US',
  'London, UK',
  'Berlin, DE',
  'Lisbon, PT',
  'Toronto, CA',
  'Singapore, SG',
]

const firstNames = [
  'Amara',
  'Liam',
  'Noor',
  'Mateo',
  'Yuki',
  'Chloe',
  'Omar',
  'Elena',
  'Kofi',
  'Isla',
  'Rahul',
  'Zoe',
  'Mikhail',
  'Aisha',
  'Lucas',
  'Freya',
  'Hugo',
  'Leila',
  'Felix',
  'Nia',
  'Andre',
  'Sana',
  'Jonas',
  'Ines',
]

const lastNames = [
  'Adeyemi',
  'Brooks',
  'Castillo',
  'Dubois',
  'Ellison',
  'Fischer',
  'Gupta',
  'Haddad',
  'Ivanov',
  'Jensen',
  'Kowalski',
  'Lindqvist',
  'Moreau',
  'Nakamura',
  'Oliveira',
  'Petrov',
  'Quinn',
  'Rossi',
  'Sato',
  'Tanaka',
  'Underwood',
  'Varga',
  'Walker',
  'Yilmaz',
]

// Deterministic so the docs preview (and SSR) renders the same rows every time.
function build(count: number): Employee[] {
  return Array.from({ length: count }, (_, i) => {
    const department = departments[(i * 3 + 1) % departments.length]
    const deptRoles = roles[department]
    const first = firstNames[i % firstNames.length]
    const last = lastNames[(i * 7 + 3) % lastNames.length]
    const year = 2016 + ((i * 5) % 9)
    const month = ((i * 7) % 12) + 1
    const day = ((i * 11) % 27) + 1
    const hireDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const onProbation = year === 2024
    const status: EmployeeStatus = onProbation
      ? 'Probation'
      : i % 11 === 0
        ? 'On leave'
        : i % 4 === 0
          ? 'Remote'
          : 'Active'
    const seniority = 2025 - year

    return {
      id: String(i + 1),
      name: `${first} ${last}`,
      email: `${first}.${last}@acme.co`.toLowerCase(),
      role: deptRoles[i % deptRoles.length],
      department,
      status,
      location: locations[(i * 5 + 2) % locations.length],
      manager: managers[department],
      hireDate,
      salary: baseSalary[department] + seniority * 2400 + ((i * 1370) % 9000),
      performance: onProbation ? 3 : ((i * 5) % 4) + 2,
    }
  })
}

export const employees: Employee[] = build(48)
