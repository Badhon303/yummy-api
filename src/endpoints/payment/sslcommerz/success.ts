import type { PayloadHandler } from 'payload'
import { validateSSLPayment } from '../../../lib/payment/sslcommerz'

export const sslSuccess: PayloadHandler = async (req) => {
  const body = await req.json?.()
  const frontendURL = process.env.FRONTEND_URL!

  const validation = await validateSSLPayment(body.val_id)

  if (validation.status !== 'VALID' && validation.status !== 'VALIDATED') {
    return Response.redirect(`${frontendURL}/checkout/payment-failed?reason=validation_failed`)
  }

  const orderId = body.tran_id
  const orderNumber = body.value_a

  const payments = await req.payload.find({
    collection: 'payments',
    where: { order: { equals: orderId } },
    overrideAccess: true,
  })

  if (payments.docs.length) {
    await req.payload.update({
      collection: 'payments',
      id: (payments.docs[0] as any).id,
      data: {
        status: 'success',
        transactionId: body.tran_id,
        gatewayOrderId: body.val_id,
        rawResponse: validation,
        completedAt: new Date().toISOString(),
      },
      overrideAccess: true,
    })
  }

  await req.payload.update({
    collection: 'orders',
    id: orderId,
    data: { paymentStatus: 'paid' },
    overrideAccess: true,
  })

  return Response.redirect(`${frontendURL}/checkout/confirmation?order=${orderNumber}`)
}
