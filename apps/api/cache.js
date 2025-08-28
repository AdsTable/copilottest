// Simple in-memory TTL cache. For production, replace with Redis.
export class TTLCache {
  constructor() {
    this.map = new Map();
  }
  set(key, value, ttlSec) {
    const expires = Date.now() + ttlSec * 1000;
    this.map.set(key, { value, expires });
  }
  get(key) {
    const entry = this.map.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expires) {
      this.map.delete(key);
      return undefined;
    }
    return entry.value;
  }
  delete(key) {
    this.map.delete(key);
  }
  clear() {
    this.map.clear();
  }
}
export const cache = new TTLCache();