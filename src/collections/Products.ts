import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  labels: {
    singular: '🍕 Product',
    plural: '🍕 Products',
  },
  admin: { useAsTitle: 'name', group: '🏪 Product Management' },
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
      admin: { readOnly: true, description: 'URL-friendly identifier. Auto-generated from name.' },
    },
    { name: 'category', type: 'relationship', relationTo: 'categories', required: true },
    { name: 'description', type: 'text' },
    { name: 'shortDescription', type: 'text' },
    { name: 'basePrice', type: 'number', required: true, min: 0 },
    {
      type: 'row',
      fields: [
        { name: 'isNew', type: 'checkbox', defaultValue: false },
        { name: 'isBestseller', type: 'checkbox', defaultValue: false },
        { name: 'isActive', type: 'checkbox', defaultValue: true },
      ],
    },
    {
      type: 'group',
      name: 'image',
      fields: [
        {
          name: 'localImage',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'externalImage',
          type: 'text',
        },
      ],
    },
    {
      name: 'gallery',
      type: 'group',
      fields: [
        {
          name: 'localImage',
          type: 'upload',
          relationTo: 'media',
          hasMany: true,
        },
        {
          name: 'externalImages',
          type: 'array',
          minRows: 1,
          fields: [{ name: 'url', type: 'text', required: true }],
        },
      ],
    },
    {
      name: 'tags',
      type: 'array',
      minRows: 1,
      fields: [{ name: 'tag', type: 'text', required: true }],
    },
    {
      name: 'ingredients',
      type: 'array',
      minRows: 1,
      fields: [{ name: 'ingredient', type: 'text', required: true }],
    },
    {
      name: 'variants',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'variant', type: 'text', required: true },
        { name: 'price', type: 'number', required: true, min: 0 },
      ],
    },
    {
      name: 'averageRating',
      type: 'number',
      admin: { readOnly: true },
      defaultValue: 0,
    },
    {
      name: 'reviewCount',
      type: 'number',
      admin: { readOnly: true },
      defaultValue: 0,
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data.name && !data.slug) {
          data.slug = data.name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc }) => {
        const { invalidatePattern } = await import('../lib/cache')
        await invalidatePattern(`product:${doc.slug}`)
        await invalidatePattern('products:*')
        await invalidatePattern('products:bestsellers')
      },
    ],
  },
}
