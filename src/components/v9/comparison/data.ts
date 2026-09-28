import type { Feature, Plan } from './comparison'

export const plans: Plan[] = [
  { id: 'basic', name: 'Basic', price: '$9', period: '/month', cta: 'Get started' },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    period: '/month',
    highlighted: true,
    cta: 'Start free trial',
  },
  { id: 'enterprise', name: 'Enterprise', price: '$99', period: '/month', cta: 'Contact sales' },
]

export const features: Feature[] = [
  {
    id: 'users',
    label: 'Team members',
    values: { basic: '5', pro: '20', enterprise: 'Unlimited' },
  },
  {
    id: 'storage',
    label: 'Storage',
    values: { basic: '10 GB', pro: '100 GB', enterprise: '1 TB' },
  },
  {
    id: 'api',
    label: 'API access',
    values: { basic: false, pro: true, enterprise: true },
  },
  {
    id: 'support',
    label: 'Priority support',
    values: { basic: false, pro: true, enterprise: true },
  },
  {
    id: 'domain',
    label: 'Custom domain',
    values: { basic: false, pro: true, enterprise: true },
  },
  {
    id: 'sso',
    label: 'Single sign-on',
    values: { basic: false, pro: false, enterprise: true },
  },
]
