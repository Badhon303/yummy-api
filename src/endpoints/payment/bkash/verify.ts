import type { PayloadHandler } from 'payload'
import { queryBkashPayment } from '../../../lib/payment/bkash'

export const bkashVerify: PayloadHandler = async (req) => {
  const body = await req.json?.()
  const { paymentID } = body ?? {}

  if (!paymentID) {
    return Response.json({ error: 'paymentID required' }, { status: 400 })
  }

  const result = await queryBkashPayment(paymentID)

  return Response.json(result)
}
