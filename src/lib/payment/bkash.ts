import axios from 'axios'
import { getRedis } from '../redis'

const BKASH_BASE =
  process.env.BKASH_SANDBOX === 'true'
    ? 'https://tokenized.sandbox.bka.sh/v1.2.0-beta'
    : 'https://tokenized.pay.bka.sh/v1.2.0-beta'

async function getGrantToken(): Promise<string> {
  const redis = getRedis()
  const cached = await redis.get('bkash:grant_token')
  if (cached) return cached

  const res = await axios.post(
    `${BKASH_BASE}/tokenized/checkout/token/grant`,
    {
      app_key: process.env.BKASH_APP_KEY,
      app_secret: process.env.BKASH_APP_SECRET,
    },
    {
      headers: {
        username: process.env.BKASH_USERNAME!,
        password: process.env.BKASH_PASSWORD!,
        'Content-Type': 'application/json',
      },
    },
  )

  const token = res.data.id_token
  const expiresIn = res.data.expires_in || 3600
  await redis.set('bkash:grant_token', token, 'EX', expiresIn - 60)
  return token
}

export async function createBkashPayment(params: {
  amount: number
  orderId: string
  callbackURL: string
}): Promise<{ bkashURL: string; paymentID: string }> {
  const token = await getGrantToken()

  const res = await axios.post(
    `${BKASH_BASE}/tokenized/checkout/create`,
    {
      mode: '0011',
      payerReference: params.orderId,
      callbackURL: params.callbackURL,
      amount: params.amount.toFixed(2),
      currency: 'BDT',
      intent: 'sale',
      merchantInvoiceNumber: params.orderId,
    },
    {
      headers: {
        Authorization: token,
        'X-APP-Key': process.env.BKASH_APP_KEY!,
        'Content-Type': 'application/json',
      },
    },
  )

  if (res.data.statusCode !== '0000') {
    throw new Error(`bKash create failed: ${res.data.statusMessage}`)
  }

  return { bkashURL: res.data.bkashURL, paymentID: res.data.paymentID }
}

export async function executeBkashPayment(paymentID: string): Promise<any> {
  const token = await getGrantToken()

  const res = await axios.post(
    `${BKASH_BASE}/tokenized/checkout/execute`,
    { paymentID },
    {
      headers: {
        Authorization: token,
        'X-APP-Key': process.env.BKASH_APP_KEY!,
        'Content-Type': 'application/json',
      },
    },
  )

  return res.data
}

export async function queryBkashPayment(paymentID: string): Promise<any> {
  const token = await getGrantToken()
  const res = await axios.post(
    `${BKASH_BASE}/tokenized/checkout/payment/status`,
    { paymentID },
    {
      headers: {
        Authorization: token,
        'X-APP-Key': process.env.BKASH_APP_KEY!,
        'Content-Type': 'application/json',
      },
    },
  )
  return res.data
}
