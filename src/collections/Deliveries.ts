import type { CollectionConfig } from 'payload'

export const Deliveries: CollectionConfig = {
  slug: 'deliveries',
  labels: {
    singular: '🚚 Delivery',
    plural: '🚚 Deliveries',
  },
  admin: {
    group: '🦖 Order Management',
  },
  access: {
    read: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'staff',
    create: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'staff',
    update: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'staff',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'order', type: 'relationship', relationTo: 'orders', required: true },
    { name: 'deliveryPersonName', type: 'text' },
    { name: 'deliveryPersonPhone', type: 'text' },
    {
      name: 'deliveryStatus',
      type: 'select',
      required: true,
      defaultValue: 'assigning',
      options: [
        { label: 'Assigning', value: 'assigning' },
        { label: 'In Transit', value: 'in_transit' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Failed', value: 'failed' },
      ],
    },
    { name: 'estimatedDeliveryTime', type: 'date' },
    { name: 'actualDeliveryTime', type: 'date' },
    { name: 'trackingUrl', type: 'text' },
    { name: 'notes', type: 'textarea' },
  ],
}
