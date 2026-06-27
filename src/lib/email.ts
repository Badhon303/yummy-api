import { Resend } from 'resend'

let resend: Resend | null = null

function getResend(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

type OrderEmailData = {
  orderNumber: string
  guestEmail?: string
  guestName?: string
  totalAmount: number
  orderStatus: string
  paymentStatus: string
  items?: any[]
}

export async function sendOrderEmail(
  order: OrderEmailData,
  type: 'confirmation' | 'status_update' = 'confirmation',
): Promise<void> {
  const from = process.env.EMAIL_FROM || 'orders@yummybakery.com'
  const to = order.guestEmail

  if (!to) return

  const subject =
    type === 'confirmation'
      ? `Order Confirmation — ${order.orderNumber}`
      : `Order Update — ${order.orderNumber}`

  const itemsHtml =
    order.items
      ?.map(
        (item: any) =>
          `<tr><td>${item.productName || ''}</td><td>${item.quantity}</td><td>৳${item.unitPrice}</td><td>৳${item.subtotal}</td></tr>`,
      )
      .join('') || ''

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #d4a574;">Yummy Bakery</h1>
      <p>Happiness in Every Bite</p>
      <hr />
      <h2>${type === 'confirmation' ? 'Order Confirmed' : 'Order Status Updated'}</h2>
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p><strong>Status:</strong> ${order.orderStatus}</p>
      <p><strong>Payment:</strong> ${order.paymentStatus}</p>
      <p><strong>Total:</strong> ৳${order.totalAmount}</p>
      ${itemsHtml ? `<table style="width:100%; border-collapse: collapse;"><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead><tbody>${itemsHtml}</tbody></table>` : ''}
      <hr />
      <p>Thank you for choosing Yummy Bakery!</p>
    </div>
  `

  try {
    await getResend().emails.send({ from, to, subject, html })
  } catch (err) {
    console.error('[Email Error]', err)
  }
}
