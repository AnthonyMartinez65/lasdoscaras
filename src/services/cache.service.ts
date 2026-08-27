/**
 * Servicio de Caché Local.
 * Actúa como un wrapper seguro sobre localStorage. Permite guardar datos
 * con un tiempo de vida (TTL) opcional, eliminándolos automáticamente si expiran.
 */
export class CacheService {
  static set<T>(key: string, data: T, ttlMinutes?: number): void {
    const item = {
      data,
      expiry: ttlMinutes ? new Date().getTime() + ttlMinutes * 60000 : null,
    };
    localStorage.setItem(key, JSON.stringify(item));
  }

  /**
   * Recupera y parsea un dato del localStorage.
   * Si el dato tenía un TTL y ya expiró, lo elimina y devuelve null.
   */
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