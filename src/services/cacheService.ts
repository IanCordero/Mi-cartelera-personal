import AsyncStorage from '@react-native-async-storage/async-storage';
import { ItemLista } from '../types';
import { esItemLista } from '../utils/validation';
export interface CopiaLista { guardadaEn: string; items: ItemLista[] }
const clave = (uid: string) => `@cartelera:v1:${uid}`;
// Una cadena por usuario impide que una escritura lenta reemplace una copia nueva.
const colas = new Map<string, Promise<void>>();
export async function leerCache(uid: string): Promise<CopiaLista | null> {
  await colas.get(uid)?.catch(() => undefined);
  const raw = await AsyncStorage.getItem(clave(uid));
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object') return null;
    const d = value as Record<string, unknown>;
    if (typeof d.guardadaEn !== 'string' || !Array.isArray(d.items) || !d.items.every(esItemLista)) return null;
    return { guardadaEn: d.guardadaEn, items: d.items };
  } catch { return null; }
}
export async function guardarCache(uid: string, items: ItemLista[]): Promise<string> {
  const guardadaEn = new Date().toISOString();
  const previa = colas.get(uid) ?? Promise.resolve();
  const actual = previa.catch(() => undefined).then(() => AsyncStorage.setItem(clave(uid), JSON.stringify({ guardadaEn, items })));
  colas.set(uid, actual);
  try { await actual; return guardadaEn; }
  finally { if (colas.get(uid) === actual) colas.delete(uid); }
}
