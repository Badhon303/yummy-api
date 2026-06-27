import type { PayloadHandler } from 'payload'
import { verifyNagadPayment } from '../../../lib/payment/nagad'

export const nagadCallback: PayloadHandler = async (req) => {
  const body = await req.json?.()
  const frontendURL = process.env.FRONTEND_URL!

  const paymentRefId = body?.payment_ref_id || body?.paymentRefId
  const orderId = body?.order_id || body?.orderId

  if (!paymentRefId) {
    return Response.redirect(`${frontendURL}/checkout/payment-failed?reason=no_ref`)
  }

  const result = await verifyNagadPayment(paymentRefId)

  if (result.status === 'Success' || result.statusCode === '0') {
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
          transactionId: paymentRefId,
          gatewayRefId: paymentRefId,
          rawResponse: result,
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

    const order = await req.payload.findByID({
      collection: 'orders',
      id: orderId,
      overrideAccess: true,
    })

    return Response.redirect(
      `${frontendURL}/checkout/confirmation?order=${(order as any).orderNumber}`,
    )
  }

  return Response.redirect(`${frontendURL}/checkout/payment-failed?reason=nagad_failed`)
}
