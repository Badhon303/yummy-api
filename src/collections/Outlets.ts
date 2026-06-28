import type { CollectionConfig } from 'payload'

export const Outlets: CollectionConfig = {
  slug: 'outlets',
  labels: {
    singular: '✨ Outlet',
    plural: '✨ Outlets',
  },
  admin: {
    useAsTitle: 'name',
    group: '⚙️ Settings',
  },
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'area',
      type: 'text',
      required: true,
    },
    {
      name: 'city',
      type: 'text',
      required: true,
    },
    {
      name: 'address',
      type: 'textarea',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
      required: true,
    },
    {
      name: 'openingHours',
      type: 'group',
      fields: [
        { name: 'open', type: 'text', defaultValue: '8:00 AM' },
        { name: 'close', type: 'text', defaultValue: '11:00 PM' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'lat',
          type: 'number',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'lng',
          type: 'number',
          required: true,
          admin: { width: '50%' },
        },
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
      type: 'row',
      fields: [
        {
          name: 'supportsDelivery',
          type: 'checkbox',
          defaultValue: true,
          admin: { width: '50%' },
        },
        {
          name: 'supportsPickup',
          type: 'checkbox',
          defaultValue: true,
          admin: { width: '50%' },
        },
      ],
    },
  ],
}
