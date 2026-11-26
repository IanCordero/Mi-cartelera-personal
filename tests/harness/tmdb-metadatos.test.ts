import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { obtenerDetalle } from '../../src/services/tmdbService';
const respuesta = (data: unknown) => new Response(JSON.stringify(data), { status: 200 });
function simular(detalle: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) =>
      url.includes('/configuration')
        ? respuesta({
            images: {
              secure_base_url: 'https://image.tmdb.org/t/p/',
              poster_sizes: ['w185', 'w500'],
              profile_sizes: ['w185'],
            },
          })
        : respuesta(detalle),
    ),
  );
}
beforeEach(() => {
  vi.stubEnv('EXPO_PUBLIC_TMDB_TOKEN', 'TOKEN_FICTICIO_SIN_CREDENCIALES');
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
describe('TMDB conserva los datos necesarios para D5', () => {
  it('extrae directores de crew y sigue recuperando el elenco en el mismo detalle', async () => {
    simular({
      id: 1,
      title: 'Ejemplo',
      vote_average: 8,
      vote_count: 3,
      genres: [{ id: 1, name: 'Drama' }],
      runtime: 169,
      credits: {
        cast: [{ id: 1, name: 'Actor', character: 'Persona', profile_path: null }],
        crew: [
          { id: 2, name: 'Nolan', job: 'Director' },
          { id: 3, name: 'Productor', job: 'Producer' },
        ],
      },
    });
    const r = await obtenerDetalle('movie', 1);
    expect(r.directores).toEqual(['Nolan']);
    expect(r.duracionMin).toBe(169);
    expect(r.generos).toEqual(['Drama']);
    expect(r.elenco).toHaveLength(1);
    const peticiones = vi.mocked(fetch).mock.calls.map((c) => String(c[0]));
    expect(peticiones.some((url) => url.includes('append_to_response=credits'))).toBe(true);
    expect(peticiones.filter((url) => !url.includes('/configuration'))).toHaveLength(1);
  });
  it('una serie no guarda duración de episodio ni directores como horas de cine', async () => {
    simular({
      id: 2,
      name: 'Serie',
      vote_average: 0,
      vote_count: 0,
      genres: [],
      episode_run_time: [50],
      credits: { crew: [{ id: 2, name: 'A', job: 'Director' }] },
    });
    const r = await obtenerDetalle('tv', 2);
    expect(r.duracionMin).toBeNull();
    expect(r.directores).toEqual([]);
    expect(r.duracion).toBe(50);
  });
  it('tolera géneros, runtime y créditos faltantes', async () => {
    simular({ id: 3, title: 'Sin datos', vote_average: 0, vote_count: 0 });
    const r = await obtenerDetalle('movie', 3);
    expect(r.generos).toEqual([]);
    expect(r.directores).toEqual([]);
    expect(r.duracionMin).toBeNull();
    expect(r.elenco).toEqual([]);
  });
});
