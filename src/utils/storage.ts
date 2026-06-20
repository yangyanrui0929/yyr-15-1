import type { Scheme, ArchiveEntry } from '@/types';
import { STORAGE_KEYS } from './constants';

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function loadSchemes(): Scheme[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SCHEMES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveSchemes(schemes: Scheme[]): void {
  localStorage.setItem(STORAGE_KEYS.SCHEMES, JSON.stringify(schemes));
}

export function loadArchive(): ArchiveEntry[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ARCHIVE);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveArchive(archive: ArchiveEntry[]): void {
  localStorage.setItem(STORAGE_KEYS.ARCHIVE, JSON.stringify(archive));
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(2);
  return mins > 0 ? `${mins}:${secs.padStart(5, '0')}` : `${secs}s`;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
