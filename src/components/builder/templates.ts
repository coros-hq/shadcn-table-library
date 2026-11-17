import { defaultState, encodeState, featureBlocks } from './schema'
import type { BuilderState, FeatureId } from './schema'

// Starting points taken from the example pages. Each one rebuilds what the
// builder can express of an example: as the builder learns a feature, the
// matching example gets a template here and an "Open in builder" link on its
// page (see OpenInBuilder).

export interface Template {
  id: string
  title: string
  /** What the template shows off */
  description: string
  /** The example page it comes from */
  href: string
  state: BuilderState
}

/** Features in the order the builder lists them, as a decoded link has them */
const features = (...ids: FeatureId[]) =>
  featureBlocks.map((f) => f.id).filter((id) => ids.includes(id))

const base: BuilderState = {
  ...defaultState,
  features: features(),
  facets: [],
  presets: [],
}

export const templates: Template[] = [
  {
    id: 'editable',
    title: 'Editable products',
    description: 'Inline editing with validation on every field',
    href: '/editable-table',
    state: {
      ...base,
      columns: [
        {
          id: 'name',
          name: 'Name',
          type: 'text',
          rules: { required: true, max: 40 },
        },
        {
          id: 'price',
          name: 'Price',
          type: 'number',
          rules: { min: 0 },
        },
        {
          id: 'stock',
          name: 'Stock',
          type: 'number',
          rules: { min: 0, integer: true },
        },
        {
          id: 'category',
          name: 'Category',
          type: 'select',
          options: ['Electronics', 'Home', 'Clothing'],
        },
        { id: 'active', name: 'Active', type: 'checkbox' },
      ],
      features: features('editing', 'sorting'),
    },
  },
  {
    id: 'pinning',
    title: 'Pinned employee directory',
    description: 'A wide table with Name pinned left and Status right',
    href: '/column-pinning-table',
    state: {
      ...base,
      columns: [
        { id: 'name', name: 'Name', type: 'text', pin: 'left' },
        { id: 'email', name: 'Email', type: 'text' },
        {
          id: 'department',
          name: 'Department',
          type: 'select',
          options: ['Engineering', 'Design', 'Product', 'Support', 'Sales'],
        },
        { id: 'role', name: 'Role', type: 'text' },
        { id: 'location', name: 'Location', type: 'text' },
        { id: 'manager', name: 'Manager', type: 'text' },
        { id: 'start_date', name: 'Start date', type: 'date' },
        { id: 'salary', name: 'Salary', type: 'number' },
        {
          id: 'status',
          name: 'Status',
          type: 'select',
          options: ['Active', 'On leave', 'Inactive'],
          pin: 'right',
        },
      ],
      features: features('pinning', 'columnVisibility', 'sorting'),
    },
  },
  {
    id: 'export',
    title: 'Customer export',
    description: 'Select rows, then download them as CSV or Excel',
    href: '/export-selected-table',
    state: {
      ...base,
      columns: [
        { id: 'name', name: 'Name', type: 'text' },
        { id: 'email', name: 'Email', type: 'text' },
        { id: 'company', name: 'Company', type: 'text' },
        {
          id: 'plan',
          name: 'Plan',
          type: 'select',
          options: ['Free', 'Pro', 'Enterprise'],
        },
        { id: 'mrr', name: 'MRR', type: 'number' },
      ],
      features: features(
        'search',
        'selection',
        'pagination',
        'export',
        'sorting',
      ),
      exporting: { formats: ['csv', 'excel'], filename: 'customers' },
    },
  },
  {
    id: 'utility',
    title: 'Team utilities',
    description: 'Column toggles next to export buttons',
    href: '/utility-table',
    state: {
      ...base,
      columns: [
        { id: 'name', name: 'Name', type: 'text' },
        { id: 'email', name: 'Email', type: 'text' },
        { id: 'role', name: 'Role', type: 'text' },
        {
          id: 'status',
          name: 'Status',
          type: 'select',
          options: ['Active', 'Invited', 'Suspended'],
        },
      ],
      features: features('columnVisibility', 'export', 'sorting'),
    },
  },
  {
    id: 'actions',
    title: 'Data sources',
    description: 'A row menu to copy, duplicate and delete',
    href: '/async-actions-table',
    state: {
      ...base,
      columns: [
        { id: 'name', name: 'Name', type: 'text' },
        {
          id: 'kind',
          name: 'Kind',
          type: 'select',
          options: ['Database', 'Payments', 'CRM', 'Storage'],
        },
        {
          id: 'status',
          name: 'Status',
          type: 'select',
          options: ['Synced', 'Syncing', 'Failed'],
        },
        { id: 'last_synced', name: 'Minutes since sync', type: 'number' },
      ],
      features: features('rowActions', 'sorting'),
    },
  },
]

export const templateFor = (href: string) =>
  templates.find((t) => t.href === href)

/** The builder URL that opens with a template loaded */
export const templateLink = (template: Template) =>
  `/builder?t=${encodeState(template.state)}`
