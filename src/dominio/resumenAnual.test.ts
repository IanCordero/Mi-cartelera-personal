import { describe, expect, it } from 'vitest';
import { antigua, obra } from '../../tests/fixtures/cartelera';
import { aniosDisponibles, planificarPreparacion, resumenAnual } from './resumenAnual';
const ZONA = 'America/Guayaquil';

describe('Resumen anual · decisiones D3–D13', () => {
  it('D3: un instante de enero UTC puede pertenecer al diciembre local anterior', () => {
    const items = [obra(1, { vistaEn: '2026-01-01T02:00:00.000Z' })];
    expect(resumenAnual(items, 2025, ZONA).totalObras).toBe(1);
    expect(resumenAnual(items, 2026, ZONA).totalObras).toBe(0);
    expect(resumenAnual(items, 2026, 'UTC').totalObras).toBe(1);
    expect(resumenAnual(items, 2025, ZONA).obrasPorMes[11]).toBe(1);
  });
  it('D3: el límite opuesto se resuelve con la zona recibida, sin usar la del equipo', () => {
    const items = [obra(1, { vistaEn: '2025-12-31T18:00:00.000Z' })];
    expect(resumenAnual(items, 2026, 'Asia/Tokyo').totalObras).toBe(1);
    expect(resumenAnual(items, 2025, ZONA).totalObras).toBe(1);
  });
  it('D3: cuenta cada id una vez y conserva película/serie con el mismo tmdbId', () => {
    const pelicula = obra(550);
    const serie = obra(550, { id: 'tv_550', tipo: 'tv' });
    const r = resumenAnual([pelicula, pelicula, serie], 2026, ZONA);
    expect([r.totalObras, r.peliculas, r.series]).toEqual([2, 1, 1]);
  });
  it('D3: excluye no vistas, sin fecha y fechas inválidas; no usa agregadoEn como año', () => {
    const r = resumenAnual(
      [
        obra(1, { estado: 'viendo' }),
        obra(2, { vistaEn: null }),
        obra(3, { vistaEn: 'fecha incorrecta' }),
        antigua(4),
      ],
      2026,
      ZONA,
    );
    expect(r.totalObras).toBe(0);
  });
  it('D4: años con obras más actual, únicos y descendentes; ignora no vistas', () => {
    const items = [
      obra(1, { vistaEn: '2024-05-01T12:00:00Z' }),
      obra(2, { vistaEn: '2024-05-02T12:00:00Z' }),
      obra(3, { vistaEn: '2027-05-01T12:00:00Z' }),
      obra(4, { estado: 'por_ver', vistaEn: '2023-05-01T12:00:00Z' }),
    ];
    expect(aniosDisponibles(items, 2026, ZONA)).toEqual([2027, 2026, 2024]);
    expect(aniosDisponibles([], 2031, ZONA)).toEqual([2031]);
  });
  it('D4: también el selector usa el año local de cada fecha', () => {
    expect(aniosDisponibles([obra(1, { vistaEn: '2026-01-01T02:00:00Z' })], 2026, ZONA)).toEqual([
      2026, 2025,
    ]);
  });
  it('D7: suma solo películas y redondea horas a un decimal', () => {
    const r = resumenAnual(
      [
        obra(1, { duracionMin: 100 }),
        obra(2, { duracionMin: 125 }),
        obra(3, { id: 'tv_3', tipo: 'tv', duracionMin: null }),
      ],
      2026,
      ZONA,
    );
    expect(r.horas).toBe(3.8);
    expect(r.totalObras).toBe(3);
    expect(r.peliculasSinDuracion).toBe(0);
  });
  it('D7: película sin duración no suma y se informa; una serie no incrementa ese aviso', () => {
    const r = resumenAnual([obra(1), obra(2, { id: 'tv_2', tipo: 'tv' })], 2026, ZONA);
    expect(r.horas).toBe(0);
    expect(r.peliculasSinDuracion).toBe(1);
  });
  it('D8: cada obra suma una vez a cada género, aunque se repita el nombre', () => {
    const r = resumenAnual(
      [obra(1, { generos: ['Drama', 'Drama', 'Acción'] }), obra(2, { generos: ['Acción'] })],
      2026,
      ZONA,
    );
    expect(r.generoTop).toEqual({ nombre: 'Acción', obras: 2 });
  });
  it('D8: gana cantidad antes de una media más alta', () => {
    const r = resumenAnual(
      [
        obra(1, { generos: ['Drama'], calificacionPersonal: 1 }),
        obra(2, { generos: ['Drama'], calificacionPersonal: 1 }),
        obra(3, { generos: ['Acción'], calificacionPersonal: 5 }),
      ],
      2026,
      ZONA,
    );
    expect(r.generoTop?.nombre).toBe('Drama');
  });
  it('D8: el desempate usa promedio entre calificadas, no suma ni puntuación TMDB', () => {
    const r = resumenAnual(
      [
        obra(1, { generos: ['Drama'], calificacionPersonal: 5 }),
        obra(2, { generos: ['Drama'] }),
        obra(3, { generos: ['Acción'], calificacionPersonal: 4 }),
        obra(4, { generos: ['Acción'], calificacionPersonal: 4 }),
      ],
      2026,
      ZONA,
    );
    expect(r.generoTop?.nombre).toBe('Drama');
  });
  it('D8: sin calificadas pierde contra un género calificado, aunque sea alfabéticamente anterior', () => {
    const r = resumenAnual(
      [obra(1, { generos: ['Acción'] }), obra(2, { generos: ['Drama'], calificacionPersonal: 1 })],
      2026,
      ZONA,
    );
    expect(r.generoTop?.nombre).toBe('Drama');
  });
  it('D8: si persiste el empate se usa orden alfabético español', () => {
    const r = resumenAnual(
      [
        obra(1, { generos: ['Drama'], calificacionPersonal: 4 }),
        obra(2, { generos: ['Acción'], calificacionPersonal: 4 }),
      ],
      2026,
      ZONA,
    );
    expect(r.generoTop?.nombre).toBe('Acción');
  });
  it('D9: solo películas; cada director de una codirección recibe una obra', () => {
    const r = resumenAnual(
      [
        obra(1, { directores: ['B', 'A', 'A'] }),
        obra(2, { directores: ['B'] }),
        obra(3, { id: 'tv_3', tipo: 'tv', directores: [] }),
      ],
      2026,
      ZONA,
    );
    expect(r.directorTop).toEqual({ nombre: 'B', obras: 2 });
  });
  it('D9: los directores aplican también media, ausencia de notas y alfabeto', () => {
    const primero = resumenAnual(
      [obra(1, { directores: ['A'] }), obra(2, { directores: ['B'], calificacionPersonal: 2 })],
      2026,
      ZONA,
    );
    expect(primero.directorTop?.nombre).toBe('B');
    const segundo = resumenAnual(
      [
        obra(1, { directores: ['B'], calificacionPersonal: 2 }),
        obra(2, { directores: ['A'], calificacionPersonal: 2 }),
      ],
      2026,
      ZONA,
    );
    expect(segundo.directorTop?.nombre).toBe('A');
  });
  it('D9: sin directores suficientes devuelve null', () => {
    expect(resumenAnual([obra(1)], 2026, ZONA).directorTop).toBeNull();
  });
  it('D10: produce doce meses, ceros incluidos, y gana el mes más reciente en empate', () => {
    const r = resumenAnual(
      [obra(1, { vistaEn: '2026-01-10T12:00:00Z' }), obra(2, { vistaEn: '2026-11-10T12:00:00Z' })],
      2026,
      ZONA,
    );
    expect(r.obrasPorMes).toEqual([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0]);
    expect(r.mesTop).toBe(10);
  });
  it('D11: mayor calificación y después fecha de visionado más reciente', () => {
    const r = resumenAnual(
      [
        obra(1, { calificacionPersonal: 4, vistaEn: '2026-11-01T12:00:00Z' }),
        obra(2, { calificacionPersonal: 5, vistaEn: '2026-01-01T12:00:00Z' }),
        obra(3, { calificacionPersonal: 5, vistaEn: '2026-02-01T12:00:00Z' }),
      ],
      2026,
      ZONA,
    );
    expect(r.destacada?.id).toBe('movie_3');
  });
  it('D11: sin calificadas no elige una destacada', () => {
    expect(resumenAnual([obra(1)], 2026, ZONA).destacada).toBeNull();
  });
  it('PA-02: un empate exacto de nota y fecha se estabiliza por itemId', () => {
    expect(
      resumenAnual(
        [obra(2, { calificacionPersonal: 5 }), obra(1, { calificacionPersonal: 5 })],
        2026,
        ZONA,
      ).destacada?.id,
    ).toBe('movie_1');
  });
  it('D6: una obra sin metadatos sigue contando, pero no contribuye a horas, género o director', () => {
    const r = resumenAnual([antigua(1, { vistaEn: '2026-01-10T12:00:00Z' })], 2026, ZONA);
    // La fixture antigua elimina fecha también: volver a adjuntar solo una fecha recuperada.
    const soloFecha = { ...antigua(2), vistaEn: '2026-01-10T12:00:00Z' };
    const parcial = resumenAnual([soloFecha], 2026, ZONA);
    expect(r.totalObras).toBe(0);
    expect([parcial.totalObras, parcial.peliculas, parcial.obrasSinDatos, parcial.horas]).toEqual([
      1, 1, 1, 0,
    ]);
    expect(parcial.generoTop).toBeNull();
    expect(parcial.directorTop).toBeNull();
    expect(parcial.obrasPorMes[0]).toBe(1);
  });
  it('D6/D7: un campo de duración existente no basta si el resto de metadatos está ausente', () => {
    const parcial = { ...antigua(1), vistaEn: '2026-01-10T12:00:00Z', duracionMin: 100 };
    const r = resumenAnual([parcial], 2026, ZONA);
    expect(r.obrasSinDatos).toBe(1);
    expect(r.horas).toBe(0);
    expect(r.peliculasSinDuracion).toBe(0);
  });
  it('D12: resumen vacío seguro con doce ceros y sin ganadores', () => {
    const r = resumenAnual([], 2026, ZONA);
    expect([r.totalObras, r.peliculas, r.series, r.horas, r.obrasSinDatos]).toEqual([
      0, 0, 0, 0, 0,
    ]);
    expect(r.obrasPorMes).toEqual(Array(12).fill(0));
    expect(r.mesTop).toBeNull();
    expect(r.generoTop).toBeNull();
    expect(r.directorTop).toBeNull();
    expect(r.destacada).toBeNull();
  });
  it('no modifica el array ni sus entradas', () => {
    const entrada = Object.freeze(obra(1));
    const lista = Object.freeze([entrada]);
    expect(() => resumenAnual(lista, 2026, ZONA)).not.toThrow();
  });
});

describe('Plan de preparación · D2/D6/D13', () => {
  it('D2/D6: fechas de todos los años y metadatos solo de vistas del año elegido', () => {
    const actual = { ...antigua(2), vistaEn: '2026-02-10T12:00:00Z' };
    const anterior = { ...antigua(3), vistaEn: '2025-02-10T12:00:00Z' };
    const plan = planificarPreparacion(
      [antigua(1), actual, anterior, obra(4), obra(5, { estado: 'viendo', vistaEn: null })],
      2026,
      ZONA,
      true,
    );
    expect(plan.fechas.map((i) => i.id)).toEqual(['movie_1']);
    expect(plan.metadatos.map((i) => i.id)).toEqual(['movie_2']);
  });
  it('D13: offline no se planea ninguna escritura ni consulta TMDB', () => {
    const plan = planificarPreparacion(
      [antigua(1), { ...antigua(2), vistaEn: '2026-01-10T12:00:00Z' }],
      2026,
      ZONA,
      false,
    );
    expect(plan).toEqual({ fechas: [], metadatos: [] });
  });
  it('D6: datos válidos vacíos no producen una migración infinita', () => {
    expect(planificarPreparacion([obra(1)], 2026, ZONA, true).metadatos).toEqual([]);
  });
});
