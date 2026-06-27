import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: '🍔 Category',
    plural: '🍔 Categories',
  },
  admin: { useAsTitle: 'name', group: '⚙️ Settings' },
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { readOnly: true },
    },
    { name: 'description', type: 'textarea' },
    { name: 'sortOrder', type: 'number', unique: true },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data.name) {
          data.slug = data.name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
        }
        return data
      },
    ],
    afterChange: [
      async () => {
        const { invalidatePattern } = await import('../lib/cache')
        await invalidatePattern('categories*')
      },
    ],
  },
}
