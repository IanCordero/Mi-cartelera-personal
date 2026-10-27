import assert from 'node:assert/strict';
import { test } from 'node:test';
import { esItemLista, itemId, validarCambios, validarCredenciales } from '../src/utils/validation';
import { conTiempoMaximo, mensajeError, TiempoAgotado } from '../src/utils/errors';
import { ItemLista } from '../src/types';
const item: ItemLista = { id: 'movie_550', tmdbId: 550, tipo: 'movie', titulo: 'Prueba', anio: '1999', posterPath: null,
  estado: 'por_ver', calificacionPersonal: null, comentario: '', agregadoEn: '2026-10-26T00:00:00.000Z', actualizadoEn: '2026-10-26T00:00:00.000Z' };
test('película y serie con el mismo número tienen identidades distintas', () => {
  assert.equal(itemId({ tipo: 'movie', tmdbId: 550 }), 'movie_550');
  assert.equal(itemId({ tipo: 'tv', tmdbId: 550 }), 'tv_550');
  for (const id of [0, -1, 1.5, NaN]) assert.throws(() => itemId({ tipo: 'movie', tmdbId: id }));
});
test('las estrellas solo se permiten en Vista y deben ser enteras de 1 a 5', () => {
  for (const estado of ['por_ver', 'viendo'] as const) {
    assert.throws(() => validarCambios({ estado, calificacionPersonal: 5, comentario: '' }));
    assert.doesNotThrow(() => validarCambios({ estado, calificacionPersonal: null, comentario: '' }));
  }
  for (const rating of [0, 6, 2.5, NaN]) assert.throws(() => validarCambios({ estado: 'vista', calificacionPersonal: rating, comentario: '' }));
  for (const rating of [1, 5, null]) assert.doesNotThrow(() => validarCambios({ estado: 'vista', calificacionPersonal: rating, comentario: '' }));
});
test('comentario acepta 500 puntos Unicode, rechaza 501 y no confunde emojis con dos caracteres', () => {
  assert.doesNotThrow(() => validarCambios({ estado: 'vista', calificacionPersonal: null, comentario: '🎬'.repeat(500) }));
  assert.throws(() => validarCambios({ estado: 'vista', calificacionPersonal: null, comentario: 'a'.repeat(501) }));
});
test('no se acepta una caché corrupta o con id/calificación inválidos', () => {
  assert.equal(esItemLista(item), true);
  for (const corrupto of [null, {}, { ...item, id: 'tv_550' }, { ...item, estado: 'otro' },
    { ...item, calificacionPersonal: 4 }, { ...item, agregadoEn: '' }, { ...item, anio: 'ayer' }]) {
    assert.equal(esItemLista(corrupto), false);
  }
});
test('credenciales se validan sin alterar la contraseña', () => {
  assert.equal(validarCredenciales(' persona@correo.com ', '123456', true), null);
  assert.ok(validarCredenciales('no-es-correo', '123456', true));
  assert.ok(validarCredenciales('a@b.com', '12345', true));
  assert.equal(validarCredenciales('a@b.com', '12345', false), null);
});
test('errores de Firebase se traducen y no exponen el mensaje interno', () => {
  assert.match(mensajeError({ code: 'auth/invalid-credential' }), /incorrectos/);
  assert.match(mensajeError({ code: 'permission-denied' }), /permiso/);
  assert.doesNotMatch(mensajeError({ code: 'auth/unknown', message: 'internal-secret' }), /internal-secret/);
});
test('un tiempo máximo rechaza sin esperar indefinidamente', async () => {
  assert.equal(await conTiempoMaximo(Promise.resolve(3), 50), 3);
  await assert.rejects(conTiempoMaximo(new Promise<never>(() => undefined), 5), TiempoAgotado);
});
