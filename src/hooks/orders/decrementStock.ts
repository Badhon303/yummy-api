import type { Payload } from 'payload'

export async function decrementStock(order: any, payload: Payload): Promise<void> {
  const branchId = typeof order.branch === 'object' ? order.branch.id : order.branch

  for (const item of order.items) {
    const productId = typeof item.product === 'object' ? item.product.id : item.product

    const existing = await payload.find({
      collection: 'branch-products',
      where: {
        and: [
          { branch: { equals: branchId } },
          { product: { equals: productId } },
        ],
      },
      limit: 1,
      overrideAccess: true,
    })

    if (existing.docs.length > 0) {
      const bp = existing.docs[0] as any
      const newStock = Math.max(0, bp.stockQuantity - item.quantity)
      await payload.update({
        collection: 'branch-products',
        id: bp.id,
        data: {
          stockQuantity: newStock,
          isAvailable: newStock > 0,
        },
        overrideAccess: true,
      })
    }
  }
}
