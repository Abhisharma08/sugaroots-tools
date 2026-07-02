interface RateLimitOptions {
  interval: number; // in milliseconds
  uniqueTokenPerInterval: number; // max active users in cache
}

export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new Map<string, number[]>();

  return {
    check: (limit: number, token: string): boolean => {
      const now = Date.now();
      const userTokens = tokenCache.get(token) || [];
      
      // Filter out tokens older than interval
      const activeTokens = userTokens.filter((timestamp) => now - timestamp < options.interval);
      
      if (activeTokens.length >= limit) {
        return false; // rate limit exceeded
      }
      
      activeTokens.push(now);
      tokenCache.set(token, activeTokens);
      
      // Basic cache eviction if too large
      if (tokenCache.size > options.uniqueTokenPerInterval) {
        const firstKey = tokenCache.keys().next().value;
        if (firstKey) {
          tokenCache.delete(firstKey);
        }
      }
      
      return true;
    }
  };
}
