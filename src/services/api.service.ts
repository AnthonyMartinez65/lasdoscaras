import { CacheService } from './cache.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Callback global que se asigna desde AuthContext para limpiar la sesion
// sin crear una dependencia circular entre api.service y el contexto.
let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(cb: () => void) {
  onUnauthorized = cb;
}

export class ApiService {
  static async request<T>(endpoint: string, options: RequestInit = {}, retriesLeft = 1): Promise<T> {
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

        // 401 global: si el token expiro mientras el usuario navegaba,
        // limpiamos todo y redirigimos a /login.
        if (response.status === 401 && endpoint !== '/api/auth/login') {
          if (onUnauthorized) onUnauthorized();
          throw { status: 401, data: errorData, message: 'Su sesion ha expirado. Inicie sesion de nuevo.' };
        }

        throw { status: response.status, data: errorData };
      }

      return response.json();
    } catch (error: unknown) {

      const isNetworkError = error instanceof TypeError;
      const isGet = !options.method || options.method === 'GET';
      if (isNetworkError && isGet && retriesLeft > 0) {
        return ApiService.request<T>(endpoint, options, retriesLeft - 1);
      }

      if (!navigator.onLine || isNetworkError) {
        throw { status: 0, message: "No fue posible conectar con el servidor. Verifique su conexion e intente de nuevo." };
      }
      throw error;
    }
  }
}