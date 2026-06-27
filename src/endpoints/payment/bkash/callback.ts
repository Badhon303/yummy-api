import type { PayloadHandler } from 'payload'
import { executeBkashPayment } from '../../../lib/payment/bkash'
import { getRedis } from '../../../lib/redis'

export const bkashCallback: PayloadHandler = async (req) => {
  const url = new URL(req.url || '')
  const paymentID = url.searchParams.get('paymentID') || ''
  const status = url.searchParams.get('status') || ''
  const frontendURL = process.env.FRONTEND_URL!

  if (status === 'cancel' || status === 'failure') {
    return Response.redirect(`${frontendURL}/checkout/payment-failed?reason=${status}`)
  }

  const orderId = await getRedis().get(`bkash:payment:${paymentID}`)
  if (!orderId) return Response.redirect(`${frontendURL}/checkout/payment-failed?reason=expired`)

  const result = await executeBkashPayment(paymentID)

  if (result.statusCode === '0000' && result.transactionStatus === 'Completed') {
    const payments = await req.payload.find({
      collection: 'payments',
      where: { gatewayRefId: { equals: paymentID } },
      overrideAccess: true,
    })

    if (payments.docs.length) {
      await req.payload.update({
        collection: 'payments',
        id: (payments.docs[0] as any).id,
        data: {
          status: 'success',
          transactionId: result.trxID,
          customerMsisdn: result.customerMsisdn,
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

  return Response.redirect(`${frontendURL}/checkout/payment-failed?reason=execution_failed`)
}
