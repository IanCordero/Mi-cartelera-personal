import { describe, expect, it } from 'vitest';
import { antigua, obra } from '../../tests/fixtures/cartelera';
import { datosCompletos, normalizarMetadatos } from './metadatos';

describe('Metadatos · D5 y D6', () => {
  it('D5: película conserva géneros, duración y codirectores únicos', () => {
    expect(
      normalizarMetadatos('movie', {
        generos: [' Drama ', 'Drama', 'Acción'],
        duracionMin: 169,
        directores: ['Nolan', 'Nolan'],
      }),
    ).toEqual({ generos: ['Drama', 'Acción'], duracionMin: 169, directores: ['Nolan'] });
  });
  it('D5: series tienen duración null y directores vacíos aunque una entrada los traiga', () => {
    expect(
      normalizarMetadatos('tv', { generos: ['Drama'], duracionMin: 50, directores: ['A'] }),
    ).toEqual({ generos: ['Drama'], duracionMin: null, directores: [] });
  });
  it('D5: listas de hasta diez nombres, sin vacíos ni elementos no textuales', () => {
    const r = normalizarMetadatos('movie', {
      generos: ['', null, 4, ...Array.from({ length: 12 }, (_, i) => `G${i}`)],
      directores: Array.from({ length: 12 }, (_, i) => `D${i}`),
    });
    expect(r.generos).toHaveLength(10);
    expect(r.directores).toHaveLength(10);
    expect(r.generos[0]).toBe('G0');
  });
  it.each([-5, 0, 1001, 10.5, undefined])(
    'D5: duración %s no se presenta como válida',
    (duracionMin) => {
      expect(normalizarMetadatos('movie', { duracionMin }).duracionMin).toBeNull();
    },
  );
  it('D6: distingue campos ausentes de una respuesta válida vacía', () => {
    expect(datosCompletos(antigua(1))).toBe(false);
    expect(datosCompletos(obra(1))).toBe(true);
    expect(datosCompletos(obra(2, { tipo: 'tv', id: 'tv_2' }))).toBe(true);
  });
});
