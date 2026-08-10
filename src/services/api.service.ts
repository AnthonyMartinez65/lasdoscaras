import { CacheService } from './cache.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export class ApiService {
  static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const authData = CacheService.get<{ token: string }>('lasdoscaras_auth');
    
    const headers = {
      'Content-Type': 'application/json',
      ...(authData?.token ? { Authorization: `Bearer ${authData.token}` } : {}),
      ...options.headers,
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw { status: response.status, data: errorData };
      }
      
      return response.json();
    } catch (error: unknown) {
      if (!navigator.onLine) {
        throw { status: 0, message: "No fue posible conectar con el servidor. Verifique su conexión e intente de nuevo." };
      }
      throw error;
    }
  }
}