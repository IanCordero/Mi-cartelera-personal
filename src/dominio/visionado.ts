import type { CambiosEntrada, ItemLista } from '../types';
import { validarCambios } from '../utils/validation';
export interface PlanTransicion {
  cambios: CambiosEntrada;
  fecha: 'servidor' | 'conservar' | 'borrar';
}
export function planificarTransicion(actual: ItemLista, cambios: CambiosEntrada): PlanTransicion {
  validarCambios(cambios);
  return {
    cambios: { ...cambios },
    fecha:
      cambios.estado !== 'vista' ? 'borrar' : actual.estado === 'vista' ? 'conservar' : 'servidor',
  };
}
export function fechaParaMigrar(item: ItemLista): string | null {
  if (item.estado !== 'vista' || item.vistaEn != null) return null;
  return Number.isFinite(Date.parse(item.actualizadoEn)) ? item.actualizadoEn : null;
}
