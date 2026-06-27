import type { CollectionConfig } from 'payload'

export const Payments: CollectionConfig = {
  slug: 'payments',
  labels: {
    singular: '💳 Payment',
    plural: '💳 Payments',
  },
  admin: {
    useAsTitle: 'transactionId',
    group: '🦖 Order Management',
  },
  access: {
    read: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'staff',
    create: () => true,
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'order', type: 'relationship', relationTo: 'orders', required: true },
    {
      name: 'gateway',
      type: 'select',
      required: true,
      options: [
        { label: 'Cash on Delivery', value: 'cod' },
        { label: 'bKash', value: 'bkash' },
        { label: 'Nagad', value: 'nagad' },
        { label: 'SSLCommerz', value: 'sslcommerz' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Initiated', value: 'initiated' },
        { label: 'Success', value: 'success' },
        { label: 'Failed', value: 'failed' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Refunded', value: 'refunded' },
      ],
    },
    { name: 'amount', type: 'number', required: true },
    { name: 'currency', type: 'text', defaultValue: 'BDT', admin: { readOnly: true } },
    { name: 'transactionId', type: 'text' },
    { name: 'gatewayRefId', type: 'text' },
    { name: 'gatewayOrderId', type: 'text' },
    { name: 'merchantInvoiceNumber', type: 'text' },
    { name: 'rawResponse', type: 'json', admin: { readOnly: true } },
    { name: 'customerMsisdn', type: 'text' },
    { name: 'initiatedAt', type: 'date' },
    { name: 'completedAt', type: 'date' },
    { name: 'failureReason', type: 'text' },
  ],
}
