import type { GlobalConfig } from 'payload'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  access: {
    read: () => true,
    update: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'headline', type: 'text', defaultValue: 'Yummy Vibes' },
        { name: 'subheadline', type: 'text', defaultValue: 'Bakery' },
        { name: 'backgroundImage', type: 'upload', relationTo: 'media' },
        {
          name: 'backgroundVideo',
          type: 'text',
          admin: { description: 'Optional video URL' },
        },
      ],
    },
    {
      name: 'featuredCategories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      maxRows: 6,
    },
    {
      name: 'aboutTeaser',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'body', type: 'textarea' },
        { name: 'image', type: 'upload', relationTo: 'media' },
        { name: 'ctaText', type: 'text' },
      ],
    },
    {
      name: 'testimonials',
      type: 'array',
      fields: [
        { name: 'quote', type: 'textarea', required: true },
        { name: 'author', type: 'text', required: true },
        { name: 'location', type: 'text' },
      ],
    },
    {
      name: 'stats',
      type: 'group',
      fields: [
        { name: 'happyCustomers', type: 'number', defaultValue: 5000 },
        { name: 'bakeryItems', type: 'number', defaultValue: 50 },
        { name: 'cityOutlets', type: 'number', defaultValue: 5 },
        { name: 'yearsOfBaking', type: 'number', defaultValue: 10 },
      ],
    },
  ],
}
