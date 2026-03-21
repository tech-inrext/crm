class Cache {
  constructor() {
    this.cache = {};
  }

  set(key: string, value: any, ttlMs?: number) {
    const expiresAt = ttlMs ? Date.now() + ttlMs : null;
    const entry = { value, expiresAt };
    this.cache[key] = entry;
  }

  get(key: string) {
    const entry = this.cache[key];
    if (!entry) return null;
    // TTL check
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      delete this.cache[key];
      return null;
    }
    return entry.value;
  }

  delete(key: string) {
    delete this.cache[key];
  }

  invalidate(identifier: string) {
    // Invalidate all keys that start with the identifier
    Object.keys(this.cache).forEach((key) => {
      if (key.startsWith(identifier)) {
        delete this.cache[key];
      }
    });
  }
}

export default Cache;
