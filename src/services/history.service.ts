/**
 * Servicio de Historial de Visitas.
 * Gestiona un registro de las últimas publicaciones vistas por el usuario
 * utilizando localStorage (CacheService) con una estructura FIFO y un límite estricto de 20 entradas.
 */
import { CacheService } from './cache.service';
import type { HistoryEntry } from '../models/history.types';

const HISTORY_CACHE_KEY = 'lasdoscaras_history';
const MAX_ENTRIES = 20;

export class HistoryService {
  static getAll(): HistoryEntry[] {
    return CacheService.get<HistoryEntry[]>(HISTORY_CACHE_KEY) ?? [];
  }

  /**
   * Registra una visita a una publicación (FIFO).
   * Si la publicación ya estaba en el historial, la saca de su posición vieja
   * y la vuelve a poner al principio (con la fecha actualizada) para evitar duplicados.
   * La lista final se corta automáticamente al límite de MAX_ENTRIES (20).
   */
  static record(entry: Omit<HistoryEntry, 'visitedAt'>): void {
    const current = this.getAll().filter(e => e.viewId !== entry.viewId);
    const updated: HistoryEntry[] = [
      { ...entry, visitedAt: new Date().toISOString() },
      ...current,
    ].slice(0, MAX_ENTRIES);
    CacheService.set(HISTORY_CACHE_KEY, updated);
  }

  static clear(): void {
    CacheService.remove(HISTORY_CACHE_KEY);
  }
}