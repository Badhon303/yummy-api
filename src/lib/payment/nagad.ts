import axios from 'axios'
import crypto from 'crypto'

const NAGAD_BASE = process.env.NAGAD_SANDBOX === 'true'
  ? 'https://api.mynagad.com'
  : 'https://api.mynagad.com'

function encryptWithPublicKey(data: string): string {
  const publicKey = `-----BEGIN PUBLIC KEY-----\n${process.env.NAGAD_PG_PUBLIC_KEY}\n-----END PUBLIC KEY-----`
  return crypto
    .publicEncrypt(
      { key: publicKey, padding: crypto.constants.RSA_PKCS1_PADDING },
      Buffer.from(data),
    )
    .toString('base64')
}

function signWithPrivateKey(data: string): string {
  const privateKey = `-----BEGIN RSA PRIVATE KEY-----\n${process.env.NAGAD_MERCHANT_PRIVATE_KEY}\n-----END RSA PRIVATE KEY-----`
  const sign = crypto.createSign('SHA256')
  sign.update(data)
  return sign.sign(privateKey, 'base64')
}

export async function initNagadPayment(params: {
  amount: number
  orderId: string
  callbackURL: string
}): Promise<{ callBackUrl: string; orderId: string }> {
  const datetime = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)
  const merchantId = process.env.NAGAD_MERCHANT_ID!

  const sensitiveData = JSON.stringify({
    merchantId,
    datetime,
    orderId: params.orderId,
    challenge: crypto.randomBytes(16).toString('hex'),
  })

  const res = await axios.post(
    `${NAGAD_BASE}/api/dfs/check-out/initialize/${merchantId}/${params.orderId}`,
    {
      accountNumber: process.env.NAGAD_MERCHANT_NUMBER,
      dateTime: datetime,
      sensitiveData: encryptWithPublicKey(sensitiveData),
      signature: signWithPrivateKey(sensitiveData),
    },
    { headers: { 'X-KM-Api-Version': 'v-0.2.0', 'Content-Type': 'application/json' } },
  )

  const { sensitiveData: encRes } = res.data
  const decrypted = JSON.parse(
    crypto
      .privateDecrypt(
        {
          key: `-----BEGIN RSA PRIVATE KEY-----\n${process.env.NAGAD_MERCHANT_PRIVATE_KEY}\n-----END RSA PRIVATE KEY-----`,
          padding: crypto.constants.RSA_PKCS1_PADDING,
        },
        Buffer.from(encRes, 'base64'),
      )
      .toString(),
  )

  const placeOrderSensitiveData = JSON.stringify({
    merchantId,
    orderId: params.orderId,
    currencyCode: '050',
    challengeToken: decrypted.tokenZone,
    amount: params.amount.toFixed(2),
  })

  const placeRes = await axios.post(
    `${NAGAD_BASE}/api/dfs/check-out/complete/${decrypted.tokenZone}`,
    {
      sensitiveData: encryptWithPublicKey(placeOrderSensitiveData),
      signature: signWithPrivateKey(placeOrderSensitiveData),
      merchantCallbackURL: params.callbackURL,
    },
    { headers: { 'X-KM-Api-Version': 'v-0.2.0', 'Content-Type': 'application/json' } },
  )

  return { callBackUrl: placeRes.data.callBackUrl, orderId: params.orderId }
}

export async function verifyNagadPayment(paymentRefId: string): Promise<any> {
  const res = await axios.get(`${NAGAD_BASE}/api/dfs/verify/payment/${paymentRefId}`, {
    headers: { 'X-KM-Api-Version': 'v-0.2.0' },
  })
  return res.data
}
