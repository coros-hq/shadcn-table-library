export type Plan = {
  id: string
  name: string
  price: string
  period: string
  highlighted?: boolean
  cta: string
}

export type FeatureValue = boolean | string

export type Feature = {
  id: string
  label: string
  values: Record<string, FeatureValue>
}
