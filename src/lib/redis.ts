import { Redis } from 'ioredis'

let redis: Redis | null = null

export function getRedis(): Redis {
  if (!redis) {
    const url = process.env.REDIS_URL || 'redis://localhost:6379'
    redis = new Redis(url, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    })
    redis.on('error', (err) => console.error('[Redis Error]', err.message))
  }
  return redis
}
