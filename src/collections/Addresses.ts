import type { CollectionConfig } from 'payload'

export const Addresses: CollectionConfig = {
  slug: 'addresses',
  access: {
    create: () => true,
    read: ({ req }) => {
      if (req.user?.role === 'admin' || req.user?.role === 'staff') return true
      if (req.user) return { user: { equals: req.user.id } }
      return false
    },
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      hasMany: false,
      required: true,
      unique: true,
    },
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
        // If the user left it empty, pass validation (since it is not marked as required)
        if (!val) return true

        // BD postal codes are strictly 4 digits (e.g., 1212, 1000)
        const bdPostalRegex = /^\d{4}$/
        if (!bdPostalRegex.test(val)) {
          return 'Please enter a valid 4-digit Bangladeshi postal code.'
        }
        return true
      },
    },
  ],
}
