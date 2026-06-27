import type { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'orderStatus', 'totalAmount', 'createdAt'],
  },
  access: {
    create: () => true,
    read: ({ req }) => {
      if (req.user?.role === 'admin' || req.user?.role === 'staff') return true
      if (req.user) return { user: { equals: req.user.id } }
      return false
    },
    update: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'staff',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'orderNumber',
      type: 'text',
      unique: true,
      admin: { readOnly: true, description: 'Auto-generated: YMY-YYYYMMDD-XXXX' },
    },
    { name: 'user', type: 'relationship', relationTo: 'users' },
    {
      name: 'guestEmail',
      type: 'email',
      admin: {
        description: 'Required for guest orders (when no user is associated)',
      },
      validate: (value: any, { data }: any) => {
        if (!data.user && !value) {
          return 'Guest email is required for guest orders'
        }
        return true
      },
    },
    { name: 'guestName', type: 'text' },
    { name: 'branch', type: 'relationship', relationTo: 'branches', required: true },
    {
      name: 'shippingAddress',
      type: 'relationship',
      relationTo: 'addresses',
      required: true,
    },
    {
      name: 'orderStatus',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Preparing', value: 'preparing' },
        { label: 'Out for Delivery', value: 'out_for_delivery' },
        { label: 'Ready for Pickup', value: 'ready_for_pickup' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
    {
      name: 'orderType',
      type: 'select',
      required: true,
      options: [
        { label: 'Delivery', value: 'delivery' },
        { label: 'Pickup', value: 'pickup' },
      ],
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        { name: 'product', type: 'relationship', relationTo: 'products', required: true },
        { name: 'productName', type: 'text', admin: { readOnly: true } },
        { name: 'quantity', type: 'number', required: true, min: 1 },
        { name: 'unitPrice', type: 'number', required: true },
        { name: 'subtotal', type: 'number', admin: { readOnly: true } },
      ],
    },
    { name: 'subtotal', type: 'number', required: true },
    { name: 'deliveryFee', type: 'number', defaultValue: 0 },
    { name: 'totalAmount', type: 'number', required: true },
    { name: 'notes', type: 'textarea' },
    {
      name: 'paymentMethod',
      type: 'select',
      required: true,
      options: [
        { label: 'Cash on Delivery', value: 'cod' },
        { label: 'bKash', value: 'bkash' },
        { label: 'Nagad', value: 'nagad' },
        { label: 'SSLCommerz (Card/Net Banking)', value: 'sslcommerz' },
      ],
    },
    {
      name: 'paymentStatus',
      type: 'select',
      required: true,
      defaultValue: 'unpaid',
      options: [
        { label: 'Unpaid', value: 'unpaid' },
        { label: 'Pending Gateway', value: 'pending_gateway' },
        { label: 'Paid', value: 'paid' },
        { label: 'Failed', value: 'failed' },
        { label: 'Refunded', value: 'refunded' },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation === 'create') {
          const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
          const rand = Math.floor(1000 + Math.random() * 9000)
          data.orderNumber = `YMY-${date}-${rand}`

          if (data.items) {
            // Snapshot product names and calculate subtotals
            const items = await Promise.all(
              data.items.map(async (item: any) => {
                const productId = typeof item.product === 'object' ? item.product.id : item.product
                const product = await req.payload.findByID({
                  collection: 'products',
                  id: productId,
                  depth: 0,
                  overrideAccess: true,
                })
                return {
                  ...item,
                  productName: product?.name || item.productName || '',
                  subtotal: item.quantity * item.unitPrice,
                }
              }),
            )
            data.items = items
          }
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === 'create') {
          const { decrementStock } = await import('../hooks/orders/decrementStock')
          const { sendOrderEmail } = await import('../lib/email')
          await decrementStock(doc, req.payload)
          sendOrderEmail(
            {
              orderNumber: doc.orderNumber,
              guestEmail: doc.guestEmail,
              guestName: doc.guestName,
              totalAmount: doc.totalAmount,
              orderStatus: doc.orderStatus,
              paymentStatus: doc.paymentStatus,
              items: doc.items,
            },
            'confirmation',
          ).catch(console.error)
        }
        if (operation === 'update' && doc.orderStatus !== 'pending') {
          const { sendOrderEmail } = await import('../lib/email')
          sendOrderEmail(
            {
              orderNumber: doc.orderNumber,
              guestEmail: doc.guestEmail,
              guestName: doc.guestName,
              totalAmount: doc.totalAmount,
              orderStatus: doc.orderStatus,
              paymentStatus: doc.paymentStatus,
              items: doc.items,
            },
            'status_update',
          ).catch(console.error)
        }
        const { invalidatePattern } = await import('../lib/cache')
        const branchId = typeof doc.branch === 'object' ? doc.branch.id : doc.branch
        await invalidatePattern(`stock:branch:${branchId}*`)
      },
    ],
  },
}
