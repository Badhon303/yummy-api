import type { Payload } from 'payload'

export async function recalculateRating(
  productId: string | number,
  payload: Payload,
): Promise<void> {
  const result = await payload.find({
    collection: 'reviews',
    where: {
      and: [
        { product: { equals: productId } },
        { isApproved: { equals: true } },
      ],
    },
    limit: 0,
    overrideAccess: true,
  })

  const ratings = result.docs.map((r: any) => r.rating)
  const avg = ratings.length
    ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
    : 0

  await payload.update({
    collection: 'products',
    id: productId,
    data: {
      averageRating: Math.round(avg * 10) / 10,
      reviewCount: result.totalDocs,
    },
    overrideAccess: true,
  })
}
