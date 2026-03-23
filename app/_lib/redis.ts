import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL;

class MemoryCache {
  private cache = new Map<string, { value: string; expires: number }>();

  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, mode: string, duration: number): Promise<void> {
    this.cache.set(key, {
      value,
      expires: Date.now() + duration * 1000,
    });
  }
}

const getRedisClient = () => {
  if (REDIS_URL) {
    return new Redis(REDIS_URL);
  }
  console.warn("⚠️ REDIS_URL não encontrada. Usando cache em memória (fallback).");
  return new MemoryCache() as unknown as Redis;
};

export const redis = getRedisClient();

/**
 * Utilitário para cachear promessas
 */
export async function cacheWrapper<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  const freshData = await fetcher();
  await redis.set(key, JSON.stringify(freshData), "EX", ttlSeconds);
  return freshData;
}
