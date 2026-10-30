export type Product = {
  id: string
  name: string
  price: number
  stock: number
  category: string
}

export type FieldType = 'text' | 'number'

export interface FieldConfig {
  id: 'name' | 'price' | 'stock'
  label: string
  type: FieldType
  validate: (raw: string) => string | null
}

export const editableFields: FieldConfig[] = [
  {
    id: 'name',
    label: 'Name',
    type: 'text',
    validate: (raw) => (raw.trim().length > 0 ? null : 'Name is required'),
  },
  {
    id: 'price',
    label: 'Price',
    type: 'number',
    validate: (raw) => {
      const n = Number(raw)
      if (raw.trim() === '' || Number.isNaN(n)) return 'Enter a number'
      if (n < 0) return 'Must be 0 or more'
      return null
    },
  },
  {
    id: 'stock',
    label: 'Stock',
    type: 'number',
    validate: (raw) => {
      const n = Number(raw)
      if (raw.trim() === '' || Number.isNaN(n) || !Number.isInteger(n)) {
        return 'Enter a whole number'
      }
      if (n < 0) return 'Must be 0 or more'
      return null
    },
  },
]
