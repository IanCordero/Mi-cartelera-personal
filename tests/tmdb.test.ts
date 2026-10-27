import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { buscar, imagenUrl, obtenerDetalle, pedirTmdb } from '../src/services/tmdbService';
const originalFetch = global.fetch;
const tokenOriginal = process.env.EXPO_PUBLIC_TMDB_TOKEN;
process.env.EXPO_PUBLIC_TMDB_TOKEN = 'TOKEN_FICTICIO_PRUEBAS';
after(() => { global.fetch = originalFetch; if (tokenOriginal === undefined) delete process.env.EXPO_PUBLIC_TMDB_TOKEN; else process.env.EXPO_PUBLIC_TMDB_TOKEN = tokenOriginal; });
const json = (value: unknown) => new Response(JSON.stringify(value), { status: 200, headers: { 'Content-Type': 'application/json' } });
test('búsqueda filtra personas, conserva tipo y contempla datos faltantes', async () => {
  global.fetch = async (url, init) => {
    assert.equal((init?.headers as Record<string, string>).Authorization, 'Bearer TOKEN_FICTICIO_PRUEBAS');
    if (String(url).includes('/configuration')) return json({ images: { secure_base_url: 'https://image.tmdb.org/t/p/', poster_sizes: ['w185','w500'], profile_sizes: ['w185'] } });
    assert.ok(String(url).includes('language=es-ES'));
    return json({ page: 1, total_pages: 600, total_results: 3, results: [
      { id: 550, media_type: 'movie', title: 'Película', release_date: '1999-01-01', poster_path: null },
      { id: 550, media_type: 'tv', name: 'Serie' }, { id: 77, media_type: 'person', name: 'Actor' },
    ] });
  };
  const r = await buscar('prueba');
  assert.equal(r.resultados.length, 2); assert.equal(r.resultados[0].anio, '1999');
  assert.equal(r.resultados[1].tipo, 'tv'); assert.equal(r.resultados[1].anio, '');
  assert.equal(r.totalPaginas, 500); assert.equal(imagenUrl(null), null);
  assert.equal(imagenUrl('/poster.jpg', true), 'https://image.tmdb.org/t/p/w500/poster.jpg');
});
test('detalle incluye credits en una sola petición y tolera sinopsis, póster y elenco ausentes', async () => {
  global.fetch = async (url) => {
    assert.ok(String(url).includes('/tv/1399?'));
    assert.ok(String(url).includes('append_to_response=credits'));
    return json({ id: 1399, name: 'Serie', vote_average: 8.1, vote_count: 40, genres: [] });
  };
  const d = await obtenerDetalle('tv', 1399);
  assert.equal(d.posterPath, null); assert.match(d.sinopsis, /Sin sinopsis/); assert.deepEqual(d.elenco, []);
});
test('sin consulta no envía peticiones', async () => {
  global.fetch = async () => { throw new Error('No debería llamarse'); };
  assert.deepEqual((await buscar('  ')).resultados, []);
});
test('TMDB 401 y 429 producen mensajes útiles', async () => {
  for (const code of [401, 429]) {
    global.fetch = async () => new Response('{}', { status: code });
    await assert.rejects(pedirTmdb('/search/multi'), code === 401 ? /token/ : /muchas peticiones/);
  }
});
