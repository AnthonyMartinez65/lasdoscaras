import { CacheService } from './cache.service';
import type { HistoryEntry } from '../models/history.types';

const HISTORY_CACHE_KEY = 'lasdoscaras_history';
const MAX_ENTRIES = 20;

export class HistoryService {
  static getAll(): HistoryEntry[] {
    return CacheService.get<HistoryEntry[]>(HISTORY_CACHE_KEY) ?? [];
  }

  // Registra una visita. Si la publicación ya estaba en el historial, la
  // saca de su posición vieja y la vuelve a poner de primera (con la
  // fecha de visita actualizada) en vez de dejar una entrada duplicada.
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