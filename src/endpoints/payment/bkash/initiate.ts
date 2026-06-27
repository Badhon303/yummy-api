import type { PayloadHandler } from 'payload'
import { createBkashPayment } from '../../../lib/payment/bkash'
import { getRedis } from '../../../lib/redis'

export const bkashInitiate: PayloadHandler = async (req) => {
  const body = await req.json?.()
  const { orderId, amount } = body ?? {}

  if (!orderId || !amount) {
    return Response.json({ error: 'orderId and amount required' }, { status: 400 })
  }

  const callbackURL = `${process.env.PAYLOAD_URL}/api/payment/bkash/callback`

  const { bkashURL, paymentID } = await createBkashPayment({
    amount,
    orderId,
    callbackURL,
  })

  await getRedis().set(`bkash:payment:${paymentID}`, orderId, 'EX', 60 * 30)

  await req.payload.create({
    collection: 'payments',
    data: {
      order: orderId,
      gateway: 'bkash',
      status: 'initiated',
      amount,
      currency: 'BDT',
      gatewayRefId: paymentID,
      initiatedAt: new Date().toISOString(),
    },
    overrideAccess: true,
  })

  return Response.json({ bkashURL, paymentID })
}
