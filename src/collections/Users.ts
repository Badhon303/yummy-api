import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 60 * 60 * 24 * 7,
    cookies: { secure: process.env.NODE_ENV === 'production' },
  },
  admin: {
    useAsTitle: 'email',
  },
  access: {
    read: ({ req }) => {
      if (req.user?.role === 'admin' || req.user?.role === 'staff') return true
      return { id: { equals: req.user?.id } }
    },
    create: () => true,
    update: ({ req, id }) => req.user?.role === 'admin' || req.user?.id === id,
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'phone', type: 'text' },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Staff', value: 'staff' },
        { label: 'Customer', value: 'customer' },
      ],
      defaultValue: 'customer',
      access: {
        update: ({ req }) => req.user?.role === 'admin',
      },
    },
  ],
}
