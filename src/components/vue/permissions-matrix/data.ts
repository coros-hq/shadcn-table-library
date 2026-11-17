export const actions = [
  { id: 'view', label: 'View' },
  { id: 'create', label: 'Create' },
  { id: 'edit', label: 'Edit' },
  { id: 'delete', label: 'Delete' },
  { id: 'export', label: 'Export' },
] as const

export type Action = (typeof actions)[number]['id']

export interface Resource {
  id: string
  name: string
  description: string
  /** The actions this resource supports. Anything else is shown as unavailable. */
  actions: Action[]
}

export interface ResourceGroup {
  id: string
  name: string
  resources: Resource[]
}

export interface Role {
  id: string
  name: string
  description: string
  /** The role this one starts from: everything it grants is inherited */
  inherits?: string
  /** System roles that always hold every permission and can't be edited */
  locked?: boolean
}

/** Each role's own grants, as `resource.action` keys. Inherited ones are not repeated here. */
export type Grants = Record<string, ReadonlySet<string>>

export const resourceGroups: ResourceGroup[] = [
  {
    id: 'projects',
    name: 'Projects',
    resources: [
      {
        id: 'projects',
        name: 'Projects',
        description: 'Repositories, settings and domains',
        actions: ['view', 'create', 'edit', 'delete', 'export'],
      },
      {
        id: 'deployments',
        name: 'Deployments',
        description: 'Trigger, promote and roll back',
        actions: ['view', 'create', 'delete'],
      },
      {
        id: 'env',
        name: 'Environment variables',
        description: 'Secrets used at build and run time',
        actions: ['view', 'create', 'edit', 'delete'],
      },
    ],
  },
  {
    id: 'billing',
    name: 'Billing',
    resources: [
      {
        id: 'invoices',
        name: 'Invoices',
        description: 'Past and upcoming invoices',
        actions: ['view', 'export'],
      },
      {
        id: 'payment-methods',
        name: 'Payment methods',
        description: 'Cards and bank accounts on file',
        actions: ['view', 'create', 'edit', 'delete'],
      },
      {
        id: 'subscription',
        name: 'Subscription',
        description: 'Plan, seats and add-ons',
        actions: ['view', 'edit'],
      },
    ],
  },
  {
    id: 'team',
    name: 'Team',
    resources: [
      {
        id: 'members',
        name: 'Members',
        description: 'Invite, change roles and remove',
        actions: ['view', 'create', 'edit', 'delete', 'export'],
      },
      {
        id: 'roles',
        name: 'Roles',
        description: 'Custom roles and their permissions',
        actions: ['view', 'create', 'edit', 'delete'],
      },
    ],
  },
  {
    id: 'security',
    name: 'Security',
    resources: [
      {
        id: 'api-keys',
        name: 'API keys',
        description: 'Personal and team tokens',
        actions: ['view', 'create', 'delete'],
      },
      {
        id: 'audit-log',
        name: 'Audit log',
        description: 'Who changed what, and when',
        actions: ['view', 'export'],
      },
    ],
  },
]

export const roles: Role[] = [
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Can look around, but not change anything.',
  },
  {
    id: 'editor',
    name: 'Editor',
    description: 'Ships work: creates projects and deploys them.',
    inherits: 'viewer',
  },
  {
    id: 'admin',
    name: 'Admin',
    description: 'Runs the team and its security settings.',
    inherits: 'editor',
  },
  {
    id: 'billing',
    name: 'Billing manager',
    description: 'A custom role for whoever pays the invoices.',
    inherits: 'viewer',
  },
  {
    id: 'owner',
    name: 'Owner',
    description: 'Created the workspace.',
    locked: true,
  },
]

const grant = (...keys: string[]) => new Set(keys)

export const initialGrants: Grants = {
  viewer: grant('projects.view', 'deployments.view', 'members.view'),
  editor: grant(
    'projects.create',
    'projects.edit',
    'projects.export',
    'deployments.create',
    'env.view',
    'env.create',
    'env.edit',
  ),
  admin: grant(
    'projects.delete',
    'deployments.delete',
    'env.delete',
    'members.create',
    'members.edit',
    'members.delete',
    'roles.view',
    'roles.create',
    'roles.edit',
    'api-keys.view',
    'api-keys.create',
    'api-keys.delete',
    'audit-log.view',
  ),
  billing: grant(
    'invoices.view',
    'invoices.export',
    'payment-methods.view',
    'payment-methods.create',
    'payment-methods.edit',
    'subscription.view',
    'subscription.edit',
  ),
  owner: grant(),
}
