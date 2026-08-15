import { CacheService } from './cache.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export class UploadService {
  // No usa ApiService.request porque ese método siempre manda
  // 'Content-Type: application/json' — para multipart/form-data el propio
  // navegador tiene que poner el header con el boundary correcto, así que
  // acá se arma el fetch a mano.
  static async uploadDocument(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const auth = CacheService.get<{ token: string }>('lasdoscaras_auth');

    const response = await fetch(`${API_URL}/api/uploads/document`, {
      method: 'POST',
      headers: auth?.token ? { Authorization: `Bearer ${auth.token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      throw { status: response.status, message: 'No fue posible subir el documento.' };
    }

    return response.json();
  }
}