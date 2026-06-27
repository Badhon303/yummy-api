import type { PayloadHandler } from 'payload'

export const trackOrder: PayloadHandler = async (req) => {
  const url = new URL(req.url || '')
  const orderNumber = url.searchParams.get('orderNumber') || ''
  const email = url.searchParams.get('email') || ''

  if (!orderNumber || !email) {
    return Response.json({ error: 'orderNumber and email are required' }, { status: 400 })
  }

  const result = await req.payload.find({
    collection: 'orders',
    where: {
      and: [
        { orderNumber: { equals: orderNumber.toUpperCase() } },
        { guestEmail: { equals: email.toLowerCase() } },
      ],
    },
    depth: 2,
    limit: 1,
    overrideAccess: true,
  })

  if (!result.docs.length) {
    return Response.json(
      { error: 'Order not found. Check your order number and email.' },
      { status: 404 },
    )
  }

  const order = result.docs[0] as any

  return Response.json({
    orderNumber: order.orderNumber,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    orderType: order.orderType,
    totalAmount: order.totalAmount,
    createdAt: order.createdAt,
    items: order.items,
  })
}
