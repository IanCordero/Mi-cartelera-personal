import { CambiosEntrada, ItemLista, Obra } from '../types';

export function itemId(obra: Pick<Obra, 'tipo' | 'tmdbId'>): string {
  if (!['movie', 'tv'].includes(obra.tipo) || !Number.isInteger(obra.tmdbId) || obra.tmdbId <= 0) {
    throw new Error('La obra no tiene un identificador válido.');
  }
  return `${obra.tipo}_${obra.tmdbId}`;
}
export function validarCambios(cambios: CambiosEntrada): void {
  if (!['por_ver', 'viendo', 'vista'].includes(cambios.estado)) throw new Error('Selecciona un estado válido.');
  if (typeof cambios.comentario !== 'string' || [...cambios.comentario].length > 500) {
    throw new Error('El comentario admite hasta 500 caracteres.');
  }
  if (cambios.calificacionPersonal !== null && (
    cambios.estado !== 'vista' || !Number.isInteger(cambios.calificacionPersonal) ||
    cambios.calificacionPersonal < 1 || cambios.calificacionPersonal > 5
  )) throw new Error('Solo puedes calificar una obra vista, con 1 a 5 estrellas.');
}
export function validarCredenciales(email: string, clave: string, registro: boolean): string | null {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Escribe un correo electrónico válido.';
  if (!clave) return 'Escribe tu contraseña.';
  if (registro && clave.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
  return null;
}
export function esItemLista(value: unknown): value is ItemLista {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  if (typeof v.tmdbId !== 'number' || !Number.isInteger(v.tmdbId) || v.tmdbId <= 0 ||
      !['movie', 'tv'].includes(String(v.tipo)) || v.id !== `${v.tipo}_${v.tmdbId}` ||
      typeof v.titulo !== 'string' || !v.titulo || [...v.titulo].length > 200 ||
      typeof v.anio !== 'string' || !/^(\d{4})?$/.test(v.anio) ||
      !(v.posterPath === null || typeof v.posterPath === 'string') ||
      typeof v.agregadoEn !== 'string' || !Number.isFinite(Date.parse(v.agregadoEn)) ||
      typeof v.actualizadoEn !== 'string' || !Number.isFinite(Date.parse(v.actualizadoEn))) return false;
  try { validarCambios(v as unknown as CambiosEntrada); return true; } catch { return false; }
}
