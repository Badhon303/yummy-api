import type { PayloadHandler } from 'payload'
import axios from 'axios'

export const revalidateWebhook: PayloadHandler = async (req) => {
  const secret = req.headers.get('x-revalidation-secret')
  if (secret !== process.env.REVALIDATION_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json?.()
  const { path, tag } = body ?? {}
  const frontendURL = process.env.FRONTEND_URL!

  await axios.post(
    `${frontendURL}/api/revalidate`,
    { path, tag },
    {
      headers: { 'x-revalidation-secret': process.env.REVALIDATION_SECRET },
    },
  )

  return Response.json({ revalidated: true })
}
