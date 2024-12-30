import { type LRUCache as _LRUCache } from "lru-cache";

interface CacheItem<T> {
  value: T;
  timestamp: number;
}

export const cache = new Map<string, CacheItem<unknown>>();

export function setCachedResponse<T>(key: string, value: T): void {
  cache.set(key, { value, timestamp: Date.now() });
}
