import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 60 * 60 * 24 * 7,
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
    },
  },
  labels: {
    singular: '🐸 User',
    plural: '🐸 Users',
  },
  admin: { useAsTitle: 'email', group: '😎 User Management' },
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
      name: 'addresses',
      type: 'array',
      labels: { singular: 'Address', plural: 'Addresses' },
      fields: [
        { name: 'recipientName', type: 'text', required: true },
        {
          name: 'phone',
          type: 'text',
          required: true,
          validate: (val: any) => {
            const bdPhoneRegex = /^(?:\+?88)?01[3-9]\d{8}$/
            if (val && !bdPhoneRegex.test(val)) {
              return 'Please enter a valid Bangladeshi phone number (e.g., +8801XXXXXXXXX or 01XXXXXXXXX).'
            }
            return true
          },
        },
        { name: 'addressLine1', type: 'text', required: true },
        { name: 'addressLine2', type: 'text' },
        { name: 'city', type: 'text', required: true },
        { name: 'area', type: 'text' },
        {
          name: 'postalCode',
          type: 'text',
          validate: (val: any) => {
            if (!val) return true
            const bdPostalRegex = /^\d{4}$/
            if (!bdPostalRegex.test(val)) {
              return 'Please enter a valid 4-digit Bangladeshi postal code.'
            }
            return true
          },
        },
        { name: 'isDefault', type: 'checkbox', defaultValue: false },
      ],
    },
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
