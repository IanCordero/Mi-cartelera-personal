import { describe, expect, it, vi } from 'vitest';
import { antigua, obra } from '../../tests/fixtures/cartelera';
import type { ItemLista, MetadatosObra } from '../types';
import { TiempoAgotado } from '../utils/errors';
import {
  prepararResumen,
  type DependenciasPreparacion,
  type ProgresoPreparacion,
} from './preparacionService';

const parametros = { anio: 2026, zonaHoraria: 'America/Guayaquil', conectado: true };
const meta: MetadatosObra = { generos: ['Drama'], duracionMin: 120, directores: ['A'] };
function escenario(items: ItemLista[]) {
  const estado = new Map(items.map((item) => [item.id, item]));
  const eventos: string[] = [];
  const progreso: ProgresoPreparacion[] = [];
  let activos = 0;
  let maximo = 0;
  const deps: DependenciasPreparacion = {
    listaActual: () => [...estado.values()],
    sigueVigente: () => true,
    migrarFecha: vi.fn(async (item) => {
      eventos.push(`fecha:${item.id}`);
      return { ...item, vistaEn: item.actualizadoEn };
    }),
    pedirMetadatos: vi.fn(async (item) => {
      activos += 1;
      maximo = Math.max(maximo, activos);
      eventos.push(`tmdb:${item.id}`);
      await Promise.resolve();
      activos -= 1;
      return meta;
    }),
    guardarMetadatos: vi.fn(async (item, datos) => {
      eventos.push(`guardar:${item.id}`);
      return { ...item, ...datos };
    }),
    aplicarConfirmado: vi.fn(async (item) => {
      estado.set(item.id, item);
    }),
  };
  return { deps, eventos, estado, progreso, maximo: () => maximo };
}
describe('Preparación D2/D6/D13 con dependencias simuladas', () => {
  it('D2/D6: primero todas las fechas y luego TMDB de una en una, con avance', async () => {
    const s = escenario([antigua(1), antigua(2)]);
    const r = await prepararResumen(s.deps, {
      ...parametros,
      alProgreso: (p) => s.progreso.push(p),
    });
    expect(s.eventos).toEqual([
      'fecha:movie_1',
      'fecha:movie_2',
      'tmdb:movie_1',
      'guardar:movie_1',
      'tmdb:movie_2',
      'guardar:movie_2',
    ]);
    expect(s.maximo()).toBe(1);
    expect(r.fallosMetadatos).toEqual([]);
    expect(
      s.progreso.some((p) => p.fase === 'metadatos' && p.completadas === 1 && p.total === 2),
    ).toBe(true);
    expect(s.estado.get('movie_1')?.comentario).toBe('Conservar mi comentario');
  });
  it('D6: un fallo TMDB conserva la obra y no detiene las siguientes', async () => {
    const s = escenario([
      { ...antigua(1), vistaEn: '2026-02-01T12:00:00Z' },
      { ...antigua(2), vistaEn: '2026-02-01T12:00:00Z' },
    ]);
    s.deps.pedirMetadatos = vi.fn(async (item) => {
      if (item.id === 'movie_1') throw new Error('TMDB no disponible');
      return meta;
    });
    const r = await prepararResumen(s.deps, parametros);
    expect(r.fallosMetadatos).toEqual(['movie_1']);
    expect(s.estado.size).toBe(2);
    expect(s.estado.get('movie_1')?.generos).toBeUndefined();
    expect(s.estado.get('movie_2')?.generos).toEqual(['Drama']);
  });
  it('D6: no consulta otra vez datos vacíos válidos y no enriquece años ajenos', async () => {
    const s = escenario([obra(1), { ...antigua(2), vistaEn: '2025-06-01T12:00:00Z' }]);
    await prepararResumen(s.deps, parametros);
    expect(s.deps.pedirMetadatos).not.toHaveBeenCalled();
    expect(s.deps.guardarMetadatos).not.toHaveBeenCalled();
  });
  it('D13: offline no llama ningún servicio de datos', async () => {
    const s = escenario([antigua(1)]);
    const r = await prepararResumen(s.deps, { ...parametros, conectado: false });
    expect(r.sinConexion).toBe(true);
    expect(s.eventos).toEqual([]);
    expect(s.deps.aplicarConfirmado).not.toHaveBeenCalled();
  });
  it('CA-31: cancelar durante TMDB impide escribir y procesar la siguiente obra', async () => {
    const s = escenario([
      { ...antigua(1), vistaEn: '2026-02-01T12:00:00Z' },
      { ...antigua(2), vistaEn: '2026-02-01T12:00:00Z' },
    ]);
    const controller = new AbortController();
    s.deps.pedirMetadatos = vi.fn(async () => {
      controller.abort();
      return meta;
    });
    const r = await prepararResumen(s.deps, { ...parametros, signal: controller.signal });
    expect(r.cancelado).toBe(true);
    expect(s.deps.guardarMetadatos).not.toHaveBeenCalled();
    expect(s.deps.pedirMetadatos).toHaveBeenCalledTimes(1);
  });
  it('un fallo de fecha no inventa un año y deja pendiente esa obra', async () => {
    const s = escenario([antigua(1)]);
    s.deps.migrarFecha = vi.fn(async () => {
      throw new Error('No se confirmó');
    });
    const r = await prepararResumen(s.deps, parametros);
    expect(r.fallosFecha).toEqual(['movie_1']);
    expect(s.deps.pedirMetadatos).not.toHaveBeenCalled();
  });
  it('un timeout de escritura interrumpe la secuencia para no superponer otra transacción incierta', async () => {
    const s = escenario([antigua(1), antigua(2)]);
    s.deps.migrarFecha = vi.fn(async () => {
      throw new TiempoAgotado();
    });
    await expect(prepararResumen(s.deps, parametros)).rejects.toBeInstanceOf(TiempoAgotado);
    expect(s.deps.migrarFecha).toHaveBeenCalledTimes(1);
  });
});
