import type { PayloadHandler } from 'payload'
import { verifyNagadPayment } from '../../../lib/payment/nagad'

export const nagadVerify: PayloadHandler = async (req) => {
  const body = await req.json?.()
  const { paymentRefId } = body ?? {}

  if (!paymentRefId) {
    return Response.json({ error: 'paymentRefId required' }, { status: 400 })
  }

  const result = await verifyNagadPayment(paymentRefId)

  return Response.json(result)
}
