import SSLCommerzPayment from 'sslcommerz-lts'

const store_id = process.env.SSLCOMMERZ_STORE_ID!
const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD!
const is_live = process.env.SSLCOMMERZ_LIVE === 'true'

export async function initiateSSLPayment(params: {
  orderId: string
  orderNumber: string
  amount: number
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  customerCity: string
}): Promise<{ GatewayPageURL: string; sessionkey: string }> {
  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)

  const data = {
    total_amount: params.amount,
    currency: 'BDT',
    tran_id: params.orderId,
    success_url: `${process.env.PAYLOAD_URL}/api/payment/sslcommerz/success`,
    fail_url: `${process.env.PAYLOAD_URL}/api/payment/sslcommerz/fail`,
    cancel_url: `${process.env.PAYLOAD_URL}/api/payment/sslcommerz/cancel`,
    ipn_url: `${process.env.PAYLOAD_URL}/api/payment/sslcommerz/ipn`,
    shipping_method: 'Courier',
    product_name: 'Yummy Bakery Order',
    product_category: 'Food',
    product_profile: 'general',
    cus_name: params.customerName,
    cus_email: params.customerEmail,
    cus_add1: params.customerAddress,
    cus_city: params.customerCity,
    cus_country: 'Bangladesh',
    cus_phone: params.customerPhone,
    ship_name: params.customerName,
    ship_add1: params.customerAddress,
    ship_city: params.customerCity,
    ship_country: 'Bangladesh',
    value_a: params.orderNumber,
  }

  const res = await sslcz.init(data)
  if (!res.GatewayPageURL) throw new Error('SSLCommerz init failed: ' + JSON.stringify(res))
  return res
}

export async function validateSSLPayment(val_id: string): Promise<any> {
  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
  return sslcz.validate({ val_id })
}
