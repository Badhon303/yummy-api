import type { Payload } from 'payload'

export async function validateStock(order: any, payload: Payload): Promise<boolean> {
  const branchId = typeof order.branch === 'object' ? order.branch.id : order.branch

  for (const item of order.items) {
    const productId = typeof item.product === 'object' ? item.product.id : item.product

    const result = await payload.find({
      collection: 'branch-products',
      where: {
        and: [
          { branch: { equals: branchId } },
          { product: { equals: productId } },
          { isAvailable: { equals: true } },
        ],
      },
      limit: 1,
      overrideAccess: true,
    })

    if (!result.docs.length) {
      return false
    }

    const bp = result.docs[0] as any
    if (bp.stockQuantity < item.quantity) {
      return false
    }
  }

  return true
}
