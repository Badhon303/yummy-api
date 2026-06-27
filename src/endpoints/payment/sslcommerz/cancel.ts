import type { PayloadHandler } from 'payload'

export const sslCancel: PayloadHandler = async (req) => {
  const body = await req.json?.()
  const frontendURL = process.env.FRONTEND_URL!
  const orderId = body?.tran_id

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
        status: 'cancelled',
      },
      overrideAccess: true,
    })
  }

  return Response.redirect(`${frontendURL}/checkout/payment-failed?reason=ssl_cancelled`)
}
