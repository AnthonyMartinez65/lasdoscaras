export class CacheService {
  static set<T>(key: string, data: T, ttlMinutes?: number): void {
    const item = {
      data,
      expiry: ttlMinutes ? new Date().getTime() + ttlMinutes * 60000 : null,
    };
    localStorage.setItem(key, JSON.stringify(item));
  }

  static get<T>(key: string): T | null {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;
    
    const item = JSON.parse(itemStr);
    if (item.expiry && new Date().getTime() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.data as T;
  }

  static remove(key: string): void {
    localStorage.removeItem(key);
  }
}