import type { ItemLista, MetadatosObra, TipoMedio } from '../types';

export interface EntradaMetadatos {
  generos?: unknown;
  duracionMin?: unknown;
  directores?: unknown;
}
export function listaNombresValida(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length <= 10 &&
    value.every((nombre) => typeof nombre === 'string')
  );
}
export function duracionValida(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 && value <= 1000;
}
function nombres(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const textos = value
    .filter((n): n is string => typeof n === 'string')
    .map((n) => n.trim())
    .filter(Boolean);
  return [...new Set(textos)].slice(0, 10);
}
export function normalizarMetadatos(tipo: TipoMedio, entrada: EntradaMetadatos): MetadatosObra {
  return {
    generos: nombres(entrada.generos),
    duracionMin:
      tipo === 'movie' && duracionValida(entrada.duracionMin) ? entrada.duracionMin : null,
    directores: tipo === 'movie' ? nombres(entrada.directores) : [],
  };
}
export function datosCompletos(
  item: Pick<ItemLista, 'tipo' | 'generos' | 'duracionMin' | 'directores'>,
): boolean {
  return (
    listaNombresValida(item.generos) &&
    listaNombresValida(item.directores) &&
    (item.duracionMin === null || duracionValida(item.duracionMin)) &&
    (item.tipo === 'movie' || (item.duracionMin === null && item.directores.length === 0))
  );
}
