import type { CollectionConfig } from 'payload'

export const Branches: CollectionConfig = {
  slug: 'branches',
  admin: { useAsTitle: 'name' },
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'location', type: 'text', required: true },
    { name: 'phone', type: 'text', required: true },
    {
      name: 'openingHours',
      type: 'group',
      fields: [
        { name: 'open', type: 'text', defaultValue: '8:00 AM' },
        { name: 'close', type: 'text', defaultValue: '11:00 PM' },
      ],
    },
    { name: 'googleMapsUrl', type: 'text' },
    { name: 'isActive', type: 'checkbox', defaultValue: true },
  ],
}
