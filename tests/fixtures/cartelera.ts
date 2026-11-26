import type { ItemLista } from '../../src/types';

export interface CamposResumenFixture {
  vistaEn: string | null;
  generos: string[];
  duracionMin: number | null;
  directores: string[];
}
export type RegistroFixture = ItemLista & CamposResumenFixture;

export function obra(id: number, cambios: Partial<RegistroFixture> = {}): RegistroFixture {
  return {
    id: `movie_${id}`,
    tmdbId: id,
    tipo: 'movie',
    titulo: `Obra ${id}`,
    anio: '2020',
    posterPath: null,
    estado: 'vista',
    calificacionPersonal: null,
    comentario: 'Conservar mi comentario',
    agregadoEn: '2025-06-10T12:00:00.000Z',
    actualizadoEn: '2026-02-10T12:00:00.000Z',
    vistaEn: '2026-01-10T12:00:00.000Z',
    generos: [],
    duracionMin: null,
    directores: [],
    ...cambios,
  };
}
export function antigua(id: number, cambios: Partial<RegistroFixture> = {}): ItemLista {
  const resultado = obra(id, cambios);
  for (const campo of ['vistaEn', 'generos', 'duracionMin', 'directores'])
    Reflect.deleteProperty(resultado, campo);
  return resultado;
}
