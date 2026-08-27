/**
 * Servicio Central de API (Capa de Red).
 * En lugar de usar Axios, este proyecto utiliza un wrapper sobre fetch (`ApiService.request`)
 * que inyecta automáticamente el token JWT y maneja errores HTTP de forma centralizada.
 */
import { CacheService } from './cache.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Callback global inyectado por `AuthContext`.
 * Sirve para forzar un cierre de sesión (logout) si el backend responde con 401
 * sin causar dependencias circulares en React.
 */
let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(cb: () => void) {
  onUnauthorized = cb;
}

export class ApiService {
  /**
   * Ejecuta una petición HTTP al backend.
   * 
   * @param endpoint - Ruta de la API (ej. '/api/views')
   * @param options - Opciones nativas de Fetch (method, body, etc.)
   * @param retriesLeft - Cantidad de reintentos automáticos en caso de fallo de red
   */
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

        // Manejo Centralizado de Errores: 
        // Intercepta 401 (Token Expirado) globalmente.
        if (response.status === 401 && endpoint !== '/api/auth/login') {
          if (onUnauthorized) onUnauthorized();
          throw { status: 401, data: errorData, message: 'Su sesion ha expirado. Inicie sesion de nuevo.' };
        }

        // Asigna mensajes de error amigables según el Status Code HTTP
        // si el backend no proporcionó uno claro.
        let message = errorData?.message || errorData?.error;
        if (!message) {
          switch (response.status) {
            case 400: message = 'Los datos enviados son inválidos. Revisa tu solicitud.'; break;
            case 401: message = 'Credenciales incorrectas o sesión no iniciada.'; break;
            case 403: message = 'No tienes los permisos necesarios para realizar esta acción.'; break;
            case 404: message = 'El recurso o página que buscas no fue encontrado.'; break;
            case 409: message = 'Hubo un conflicto (por ejemplo, el elemento ya existe).'; break;
            case 422: message = 'Los datos no cumplen con las reglas de validación del servidor.'; break;
            case 500: message = 'Error interno del servidor. Intenta nuevamente más tarde.'; break;
            default: message = 'Ocurrió un error al procesar tu solicitud.';
          }
        }

        throw { status: response.status, data: errorData, message };
      }

      return response.json();
    } catch (error: unknown) {

      const isNetworkError = error instanceof TypeError;
      const isGet = !options.method || options.method === 'GET';
      
      // Auto-reintento solo para peticiones GET si falla la red (NetworkError)
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