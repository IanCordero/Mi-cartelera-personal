import type { ItemLista, MetadatosObra } from '../types';
import { planificarPreparacion } from '../dominio/resumenAnual';
import { TiempoAgotado } from '../utils/errors';

export interface ProgresoPreparacion {
  fase: 'fechas' | 'metadatos' | 'listo' | 'sin_conexion' | 'cancelado';
  completadas: number;
  total: number;
  fallidas: number;
}
export interface ResultadoPreparacion {
  fallosFecha: string[];
  fallosMetadatos: string[];
  cancelado: boolean;
  sinConexion: boolean;
}
export interface DependenciasPreparacion {
  listaActual: () => readonly ItemLista[];
  sigueVigente: () => boolean;
  migrarFecha: (item: ItemLista) => Promise<ItemLista | null>;
  pedirMetadatos: (item: ItemLista, signal?: AbortSignal) => Promise<MetadatosObra>;
  guardarMetadatos: (item: ItemLista, datos: MetadatosObra) => Promise<ItemLista | null>;
  aplicarConfirmado: (item: ItemLista) => Promise<void>;
}
interface ParametrosPreparacion {
  anio: number;
  zonaHoraria: string;
  conectado: boolean;
  signal?: AbortSignal;
  alProgreso?: (progreso: ProgresoPreparacion) => void;
}
export async function prepararResumen(
  deps: DependenciasPreparacion,
  p: ParametrosPreparacion,
): Promise<ResultadoPreparacion> {
  const resultado: ResultadoPreparacion = {
    fallosFecha: [],
    fallosMetadatos: [],
    cancelado: false,
    sinConexion: !p.conectado,
  };
  const emitir = (fase: ProgresoPreparacion['fase'], completadas: number, total: number) =>
    p.alProgreso?.({
      fase,
      completadas,
      total,
      fallidas: resultado.fallosFecha.length + resultado.fallosMetadatos.length,
    });
  if (!p.conectado) {
    emitir('sin_conexion', 0, 0);
    return resultado;
  }
  const cancelada = () => p.signal?.aborted === true || !deps.sigueVigente();
  const finalizarCancelacion = () => {
    resultado.cancelado = true;
    emitir('cancelado', 0, 0);
    return resultado;
  };
  const fechas = planificarPreparacion(deps.listaActual(), p.anio, p.zonaHoraria, true).fechas;
  emitir('fechas', 0, fechas.length);
  for (let i = 0; i < fechas.length; i += 1) {
    if (cancelada()) return finalizarCancelacion();
    try {
      const confirmada = await deps.migrarFecha(fechas[i]);
      if (confirmada) await deps.aplicarConfirmado(confirmada);
    } catch (error) {
      if (error instanceof TiempoAgotado) throw error;
      if (cancelada()) return finalizarCancelacion();
      resultado.fallosFecha.push(fechas[i].id);
    }
    emitir('fechas', i + 1, fechas.length);
  }
  // Recalcular después de las fechas: ahora las entradas antiguas tienen año.
  const metadatos = planificarPreparacion(
    deps.listaActual(),
    p.anio,
    p.zonaHoraria,
    true,
  ).metadatos;
  emitir('metadatos', 0, metadatos.length);
  for (let i = 0; i < metadatos.length; i += 1) {
    if (cancelada()) return finalizarCancelacion();
    try {
      const datos = await deps.pedirMetadatos(metadatos[i], p.signal);
      if (cancelada()) return finalizarCancelacion();
      const confirmada = await deps.guardarMetadatos(metadatos[i], datos);
      if (confirmada) await deps.aplicarConfirmado(confirmada);
    } catch (error) {
      if (error instanceof TiempoAgotado) throw error;
      if (cancelada()) return finalizarCancelacion();
      resultado.fallosMetadatos.push(metadatos[i].id);
    }
    emitir('metadatos', i + 1, metadatos.length);
  }
  if (cancelada()) return finalizarCancelacion();
  emitir('listo', fechas.length + metadatos.length, fechas.length + metadatos.length);
  return resultado;
}
