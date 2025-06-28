type CacheEntry = {
  value: any;
  expires: number;
};

const cache: Record<string, CacheEntry> = {};

export function setCache(key: string, value: any, ttlSeconds: number) {
  cache[key] = {
    value,
    expires: Date.now() + ttlSeconds * 1000,
  };
}

export function getCache(key: string) {
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    delete cache[key];
    return null;
  }
  return entry.value;
} 