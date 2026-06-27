import type { PayloadHandler } from 'payload'
import { initNagadPayment } from '../../../lib/payment/nagad'
import { getRedis } from '../../../lib/redis'

export const nagadInitiate: PayloadHandler = async (req) => {
  const body = await req.json?.()
  const { orderId, amount } = body ?? {}

  if (!orderId || !amount) {
    return Response.json({ error: 'orderId and amount required' }, { status: 400 })
  }

  const callbackURL = `${process.env.PAYLOAD_URL}/api/payment/nagad/callback`

  const { callBackUrl, orderId: nagadOrderId } = await initNagadPayment({
    amount,
    orderId,
    callbackURL,
  })

  await getRedis().set(`nagad:payment:${orderId}`, orderId, 'EX', 60 * 30)

  await req.payload.create({
    collection: 'payments',
    data: {
      order: orderId,
      gateway: 'nagad',
      status: 'initiated',
      amount,
      currency: 'BDT',
      initiatedAt: new Date().toISOString(),
    },
    overrideAccess: true,
  })

  return Response.json({ callBackUrl, orderId: nagadOrderId })
}
