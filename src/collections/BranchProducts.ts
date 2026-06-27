import type { CollectionConfig } from 'payload'

export const BranchProducts: CollectionConfig = {
  slug: 'branch-products',
  labels: {
    singular: '🧩 Branch Product',
    plural: '🧩 Branch Products',
  },
  admin: {
    useAsTitle: 'id',
    description: 'Manages per-branch stock levels for each product.',
    group: '🏪 Product Management',
  },
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'staff',
    update: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'staff',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'branch', type: 'relationship', relationTo: 'branches', required: true },
    { name: 'product', type: 'relationship', relationTo: 'products', required: true },
    { name: 'stockQuantity', type: 'number', required: true, min: 0, defaultValue: 0 },
    { name: 'lowStockThreshold', type: 'number', required: true, defaultValue: 10 },
    { name: 'isAvailable', type: 'checkbox', defaultValue: true },
  ],
  hooks: {
    afterChange: [
      async ({ doc }) => {
        const { invalidatePattern } = await import('../lib/cache')
        const branchId = typeof doc.branch === 'object' ? doc.branch.id : doc.branch
        await invalidatePattern(`stock:branch:${branchId}*`)
        await invalidatePattern(`products:${branchId}*`)
      },
    ],
  },
}
