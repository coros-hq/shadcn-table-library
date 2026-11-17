export interface Product {
  id: string
  sku: string
  name: string
  price: number
  stock: number
  status: 'Active' | 'Draft' | 'Archived'
  category: string
}

export type FieldId = 'name' | 'price' | 'stock' | 'status' | 'category'

export const fields: { id: FieldId; label: string; numeric?: boolean }[] = [
  { id: 'name', label: 'Name' },
  { id: 'price', label: 'Price', numeric: true },
  { id: 'stock', label: 'Stock', numeric: true },
  { id: 'status', label: 'Status' },
  { id: 'category', label: 'Category' },
]

/**
 * One record the bulk update touches. An update has both sides, a new record
 * only `after`, and a removal only `before`.
 */
export type Change =
  | { id: string; kind: 'update'; before: Product; after: Product }
  | { id: string; kind: 'create'; after: Product }
  | { id: string; kind: 'delete'; before: Product }

const product = (
  id: string,
  sku: string,
  name: string,
  price: number,
  stock: number,
  status: Product['status'],
  category: string,
): Product => ({ id, sku, name, price, stock, status, category })

const update = (before: Product, after: Partial<Product>): Change => ({
  id: before.id,
  kind: 'update',
  before,
  after: { ...before, ...after },
})

// A supplier price list and a stocktake, merged into one bulk update
export const changes: Change[] = [
  update(
    product('p1', 'CHR-001', 'Aero Desk Chair', 249, 34, 'Active', 'Seating'),
    {
      price: 269,
    },
  ),
  update(
    product('p2', 'CHR-014', 'Lumbar Task Chair', 189, 12, 'Active', 'Seating'),
    {
      price: 199,
      stock: 40,
    },
  ),
  update(
    product('p3', 'DSK-120', 'Oak Standing Desk', 649, 8, 'Active', 'Desks'),
    {
      price: 699,
      stock: 0,
      status: 'Archived',
    },
  ),
  update(
    product('p4', 'DSK-122', 'Walnut Standing Desk', 729, 0, 'Draft', 'Desks'),
    {
      stock: 25,
      status: 'Active',
    },
  ),
  update(
    product('p5', 'LMP-031', 'Arc Floor Lmap', 129, 51, 'Active', 'Lighting'),
    {
      name: 'Arc Floor Lamp',
    },
  ),
  update(
    product('p6', 'LMP-044', 'Task Light Mini', 59, 140, 'Active', 'Lighting'),
    {
      price: 54,
      stock: 128,
    },
  ),
  update(
    product(
      'p7',
      'STR-210',
      'Modular Shelf Unit',
      319,
      17,
      'Active',
      'Shelving',
    ),
    {
      category: 'Storage',
    },
  ),
  update(
    product('p8', 'STR-215', 'Cable Tray', 39, 300, 'Active', 'Accessories'),
    {
      price: 45,
      category: 'Storage',
    },
  ),
  {
    id: 'p9',
    kind: 'create',
    after: product('p9', 'CHR-020', 'Mesh Stool', 149, 60, 'Draft', 'Seating'),
  },
  {
    id: 'p10',
    kind: 'create',
    after: product(
      'p10',
      'ACC-310',
      'Monitor Arm',
      99,
      75,
      'Active',
      'Accessories',
    ),
  },
  {
    id: 'p11',
    kind: 'delete',
    before: product(
      'p11',
      'DSK-090',
      'Pine Writing Desk',
      279,
      0,
      'Archived',
      'Desks',
    ),
  },
]

/** Products the bulk update doesn't touch */
export const unchanged: Product[] = [
  product('u1', 'CHR-008', 'Ergo Kneeling Chair', 219, 22, 'Active', 'Seating'),
  product('u2', 'DSK-101', 'Compact Desk', 299, 41, 'Active', 'Desks'),
  product('u3', 'LMP-020', 'Clamp Desk Lamp', 79, 96, 'Active', 'Lighting'),
  product('u4', 'STR-200', 'Rolling Pedestal', 189, 30, 'Active', 'Storage'),
  product('u5', 'ACC-300', 'Desk Mat', 35, 210, 'Active', 'Accessories'),
]

/** One table row: a product, and the change waiting for it if there is one */
export interface CatalogRow {
  id: string
  /** What the catalog shows today; for a new product, what it would be */
  product: Product
  change?: Change
}

// The whole catalog in SKU order, so changed products sit among the rest
export const rows: CatalogRow[] = [
  ...unchanged.map((p) => ({ id: p.id, product: p })),
  ...changes.map((change) => ({
    id: change.id,
    product: change.kind === 'create' ? change.after : change.before,
    change,
  })),
].sort((a, b) => a.product.sku.localeCompare(b.product.sku))
