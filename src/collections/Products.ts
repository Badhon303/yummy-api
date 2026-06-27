import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: { useAsTitle: 'name' },
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
      admin: { description: 'URL-friendly identifier. Auto-generated from name.' },
    },
    { name: 'category', type: 'relationship', relationTo: 'categories', required: true },
    { name: 'description', type: 'richText' },
    { name: 'shortDescription', type: 'textarea' },
    { name: 'basePrice', type: 'number', required: true, min: 0 },
    { name: 'isNew', type: 'checkbox', defaultValue: false },
    { name: 'isBestseller', type: 'checkbox', defaultValue: false },
    { name: 'isActive', type: 'checkbox', defaultValue: true },
    {
      name: 'images',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'alt', type: 'text' },
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
