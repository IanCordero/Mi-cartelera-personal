import type { ItemLista } from '../types';
import { datosCompletos, duracionValida } from './metadatos';
import { fechaParaMigrar } from './visionado';

export interface PreferenciaAnual {
  nombre: string;
  obras: number;
}
export interface ResumenAnual {
  anio: number;
  totalObras: number;
  peliculas: number;
  series: number;
  horas: number;
  peliculasSinDuracion: number;
  obrasSinDatos: number;
  generoTop: PreferenciaAnual | null;
  directorTop: PreferenciaAnual | null;
  obrasPorMes: number[];
  mesTop: number | null;
  destacada: ItemLista | null;
}
export interface PartesVisionado {
  anio: number;
  mes: number;
  instante: number;
}
export function partesVisionado(
  fecha: string | null | undefined,
  zonaHoraria: string,
): PartesVisionado | null {
  if (typeof fecha !== 'string') return null;
  const instante = Date.parse(fecha);
  if (!Number.isFinite(instante)) return null;
  // Solo se interpreta la fecha recibida; nunca se consulta la hora actual.
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: zonaHoraria,
    year: 'numeric',
    month: 'numeric',
  }).formatToParts(new Date(instante));
  return {
    anio: Number(partes.find((p) => p.type === 'year')?.value),
    mes: Number(partes.find((p) => p.type === 'month')?.value) - 1,
    instante,
  };
}
function unicas(items: readonly ItemLista[]): ItemLista[] {
  const porId = new Map<string, ItemLista>();
  for (const item of items) if (!porId.has(item.id)) porId.set(item.id, item);
  return [...porId.values()];
}
export function aniosDisponibles(
  items: readonly ItemLista[],
  anioActual: number,
  zonaHoraria: string,
): number[] {
  const anios = new Set([anioActual]);
  for (const item of unicas(items)) {
    if (item.estado !== 'vista') continue;
    const fecha = partesVisionado(item.vistaEn, zonaHoraria);
    if (fecha) anios.add(fecha.anio);
  }
  return [...anios].sort((a, b) => b - a);
}
interface Cuenta {
  nombre: string;
  obras: number;
  suma: number;
  notas: number;
}
function notaValida(value: number | null): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 5;
}
function sumar(mapa: Map<string, Cuenta>, nombres: string[], nota: number | null): void {
  for (const nombre of new Set(nombres.map((n) => n.trim()).filter(Boolean))) {
    const fila = mapa.get(nombre) ?? { nombre, obras: 0, suma: 0, notas: 0 };
    fila.obras += 1;
    if (notaValida(nota)) {
      fila.suma += nota;
      fila.notas += 1;
    }
    mapa.set(nombre, fila);
  }
}
function preferida(mapa: Map<string, Cuenta>): PreferenciaAnual | null {
  const orden = [...mapa.values()].sort((a, b) => {
    if (a.obras !== b.obras) return b.obras - a.obras;
    if (!a.notas && b.notas) return 1;
    if (a.notas && !b.notas) return -1;
    if (a.notas && b.notas) {
      const diferencia = b.suma * a.notas - a.suma * b.notas;
      if (diferencia) return diferencia;
    }
    return (
      a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }) ||
      a.nombre.localeCompare(b.nombre, 'es')
    );
  });
  return orden[0] ? { nombre: orden[0].nombre, obras: orden[0].obras } : null;
}
export function resumenAnual(
  items: readonly ItemLista[],
  anio: number,
  zonaHoraria: string,
): ResumenAnual {
  const r: ResumenAnual = {
    anio,
    totalObras: 0,
    peliculas: 0,
    series: 0,
    horas: 0,
    peliculasSinDuracion: 0,
    obrasSinDatos: 0,
    generoTop: null,
    directorTop: null,
    obrasPorMes: Array<number>(12).fill(0),
    mesTop: null,
    destacada: null,
  };
  const generos = new Map<string, Cuenta>();
  const directores = new Map<string, Cuenta>();
  let minutos = 0;
  let fechaDestacada = -Infinity;
  for (const item of unicas(items)) {
    if (item.estado !== 'vista') continue;
    const fecha = partesVisionado(item.vistaEn, zonaHoraria);
    if (!fecha || fecha.anio !== anio) continue;
    r.totalObras += 1;
    r.obrasPorMes[fecha.mes] += 1;
    if (item.tipo === 'movie') {
      r.peliculas += 1;
      if (!duracionValida(item.duracionMin)) r.peliculasSinDuracion += 1;
    } else r.series += 1;
    if (!datosCompletos(item)) r.obrasSinDatos += 1;
    else {
      sumar(generos, item.generos ?? [], item.calificacionPersonal);
      if (item.tipo === 'movie') {
        if (duracionValida(item.duracionMin)) minutos += item.duracionMin;
        sumar(directores, item.directores ?? [], item.calificacionPersonal);
      }
    }
    if (notaValida(item.calificacionPersonal)) {
      const notaAnterior = r.destacada?.calificacionPersonal ?? -1;
      if (
        item.calificacionPersonal > notaAnterior ||
        (item.calificacionPersonal === notaAnterior &&
          (fecha.instante > fechaDestacada ||
            (fecha.instante === fechaDestacada &&
              item.id.localeCompare(r.destacada?.id ?? '') < 0)))
      ) {
        r.destacada = item;
        fechaDestacada = fecha.instante;
      }
    }
  }
  r.horas = Math.round(minutos / 6) / 10;
  r.generoTop = preferida(generos);
  r.directorTop = preferida(directores);
  for (let mes = 0; mes < 12; mes += 1) {
    if (
      r.obrasPorMes[mes] > 0 &&
      (r.mesTop === null || r.obrasPorMes[mes] >= r.obrasPorMes[r.mesTop])
    )
      r.mesTop = mes;
  }
  return r;
}
export function planificarPreparacion(
  items: readonly ItemLista[],
  anio: number,
  zonaHoraria: string,
  conectado: boolean,
): { fechas: ItemLista[]; metadatos: ItemLista[] } {
  if (!conectado) return { fechas: [], metadatos: [] };
  const lista = unicas(items);
  return {
    fechas: lista.filter((item) => fechaParaMigrar(item) !== null),
    metadatos: lista.filter(
      (item) =>
        item.estado === 'vista' &&
        partesVisionado(item.vistaEn, zonaHoraria)?.anio === anio &&
        !datosCompletos(item),
    ),
  };
}
export function pendientesFecha(items: readonly ItemLista[]): number {
  return unicas(items).filter(
    (item) => item.estado === 'vista' && !Number.isFinite(Date.parse(item.vistaEn ?? '')),
  ).length;
}
export function formatearHoras(horas: number): string {
  return `${horas.toFixed(1).replace('.', ',')} h`;
}
