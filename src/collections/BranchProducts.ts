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
    { name: 'branch', type: 'relationship', relationTo: 'outlets', required: true },
    { name: 'product', type: 'relationship', relationTo: 'products', required: true },
    {
      name: 'stockQuantity',
      type: 'number',
      required: true,
      min: 0,
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Current stock on hand. Use "Adjust Stock" below to change this value.',
      },
    },
    {
      name: 'adjustStock',
      type: 'number',
      defaultValue: 0,
      admin: {
        description:
          'Enter a positive number to add stock or a negative number to remove stock. This resets to 0 after saving.',
      },
    },
    { name: 'lowStockThreshold', type: 'number', required: true, defaultValue: 10 },
    {
      name: 'isAvailable',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        readOnly: true,
        description: 'Automatically set based on whether stock is available.',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (!data) return data
        const adjustment = Number(data.adjustStock)
        if (adjustment) {
          const current = Number(data.stockQuantity) || 0
          data.stockQuantity = Math.max(0, current + adjustment)
        }
        // Always clear the adjustment input so it doesn't persist a stale value
        data.adjustStock = 0
        // Auto-toggle availability based on current stock
        data.isAvailable = (Number(data.stockQuantity) || 0) > 0
        return data
      },
    ],
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
