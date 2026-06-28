import { getRedis } from './redis'

export const CacheKeys = {
  categories: () => 'categories',
  outlets: () => 'outlets',
  products: (branchId?: string) => `products:${branchId ?? 'all'}`,
  product: (slug: string) => `product:${slug}`,
  bestsellers: () => 'products:bestsellers',
  branchStock: (branchId: string) => `stock:branch:${branchId}`,
  reviews: (productId: string) => `reviews:${productId}`,
  siteSettings: () => 'site-settings',
  homepage: () => 'homepage',
}

export const TTL = {
  categories: 3600,
  outlets: 3600,
  products: 300,
  product: 300,
  bestsellers: 600,
  branchStock: 60,
  reviews: 300,
  globals: 3600,
}

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const val = await getRedis().get(key)
    return val ? (JSON.parse(val) as T) : null
  } catch {
    return null
  }
}

export async function setCached<T>(key: string, value: T, ttl: number): Promise<void> {
  try {
    await getRedis().set(key, JSON.stringify(value), 'EX', ttl)
  } catch {
    /* silent */
  }
}

export async function invalidatePattern(pattern: string): Promise<void> {
  try {
    const redis = getRedis()
    const keys = await redis.keys(pattern)
    if (keys.length > 0) await redis.del(...keys)
  } catch {
    /* silent */
  }
}
