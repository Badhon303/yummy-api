import type { PayloadHandler } from 'payload'
import { initiateSSLPayment } from '../../../lib/payment/sslcommerz'

export const sslInitiate: PayloadHandler = async (req) => {
  const body = await req.json?.()
  const {
    orderId,
    orderNumber,
    amount,
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
    customerCity,
  } = body ?? {}

  if (!orderId || !amount) {
    return Response.json({ error: 'orderId and amount required' }, { status: 400 })
  }

  const result = await initiateSSLPayment({
    orderId,
    orderNumber: orderNumber || orderId,
    amount,
    customerName: customerName || 'Customer',
    customerEmail: customerEmail || 'customer@yummybakery.com',
    customerPhone: customerPhone || '',
    customerAddress: customerAddress || 'Dhaka',
    customerCity: customerCity || 'Dhaka',
  })

  await req.payload.create({
    collection: 'payments',
    data: {
      order: orderId,
      gateway: 'sslcommerz',
      status: 'initiated',
      amount,
      currency: 'BDT',
      transactionId: orderId,
      initiatedAt: new Date().toISOString(),
    },
    overrideAccess: true,
  })

  return Response.json(result)
}
