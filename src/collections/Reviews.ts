import type { CollectionConfig } from 'payload'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  access: {
    create: () => true,
    read: ({ req }) => {
      if (req.user?.role === 'admin') return true
      return { isApproved: { equals: true } }
    },
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'product', type: 'relationship', relationTo: 'products', required: true },
    { name: 'user', type: 'relationship', relationTo: 'users' },
    { name: 'guestName', type: 'text' },
    { name: 'guestEmail', type: 'email' },
    { name: 'rating', type: 'number', required: true, min: 1, max: 5 },
    { name: 'comment', type: 'textarea' },
    { name: 'isApproved', type: 'checkbox', defaultValue: false },
  ],
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        const productId =
          typeof doc.product === 'object' ? doc.product.id : doc.product
        const result = await req.payload.find({
          collection: 'reviews',
          where: {
            and: [
              { product: { equals: productId } },
              { isApproved: { equals: true } },
            ],
          },
          limit: 0,
        })
        const ratings = result.docs.map((r: any) => r.rating)
        const avg = ratings.length
          ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
          : 0

        await req.payload.update({
          collection: 'products',
          id: productId,
          data: {
            averageRating: Math.round(avg * 10) / 10,
            reviewCount: result.totalDocs,
          },
        })

        const { invalidatePattern } = await import('../lib/cache')
        await invalidatePattern(`reviews:${productId}`)
        await invalidatePattern(`product:*`)
      },
    ],
  },
}
