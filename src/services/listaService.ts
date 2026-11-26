import {
  collection,
  doc,
  getDoc,
  getDocs,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore/lite';
import type { DocumentSnapshot } from 'firebase/firestore/lite';
import { obtenerAuth, obtenerDb } from '../firebase/config';
import type { CambiosEntrada, ItemLista, MetadatosObra, Obra } from '../types';
import { esItemLista, itemId } from '../utils/validation';
import { datosCompletos, normalizarMetadatos } from '../dominio/metadatos';
import { fechaParaMigrar, planificarTransicion } from '../dominio/visionado';
import { partesVisionado } from '../dominio/resumenAnual';
import { obtenerMetadatos } from './tmdbService';

function exigirUsuario(uid: string): void {
  if (obtenerAuth().currentUser?.uid !== uid)
    throw new Error('La sesión cambió. Vuelve a abrir tu lista.');
}
function referencia(uid: string, id: string) {
  exigirUsuario(uid);
  if (!/^(movie|tv)_[1-9]\d*$/.test(id)) throw new Error('La entrada no es válida.');
  return doc(obtenerDb(), 'usuarios', uid, 'mi_lista', id);
}
function convertir(documento: DocumentSnapshot): ItemLista | null {
  if (!documento.exists()) return null;
  const datos: Record<string, unknown> = documento.data();
  const item: unknown = {
    ...datos,
    id: documento.id,
    agregadoEn:
      datos.agregadoEn instanceof Timestamp ? datos.agregadoEn.toDate().toISOString() : '',
    actualizadoEn:
      datos.actualizadoEn instanceof Timestamp ? datos.actualizadoEn.toDate().toISOString() : '',
    ...(Object.prototype.hasOwnProperty.call(datos, 'vistaEn')
      ? {
          vistaEn:
            datos.vistaEn === null
              ? null
              : datos.vistaEn instanceof Timestamp
                ? datos.vistaEn.toDate().toISOString()
                : 'fecha inválida',
        }
      : {}),
  };
  if (!esItemLista(item))
    throw new Error('Hay una entrada con datos inválidos en Firestore. Revisa sus campos.');
  return item;
}
async function leerConfirmada(uid: string, id: string): Promise<ItemLista> {
  const item = convertir(await getDoc(referencia(uid, id)));
  if (!item) throw new Error('Esta entrada ya no existe. Actualiza tu lista.');
  return item;
}
export async function obtener(uid: string): Promise<ItemLista[]> {
  exigirUsuario(uid);
  const snapshot = await getDocs(collection(obtenerDb(), 'usuarios', uid, 'mi_lista'));
  return snapshot.docs
    .map((d) => convertir(d))
    .filter((item): item is ItemLista => item !== null)
    .sort((a, b) => b.agregadoEn.localeCompare(a.agregadoEn));
}
export async function agregar(
  uid: string,
  obra: Obra & Partial<MetadatosObra>,
): Promise<ItemLista> {
  exigirUsuario(uid);
  const metadatos = datosCompletos(obra)
    ? normalizarMetadatos(obra.tipo, obra)
    : await obtenerMetadatos(obra.tipo, obra.tmdbId);
  const ref = referencia(uid, itemId(obra));
  await runTransaction(obtenerDb(), async (transaction) => {
    if ((await transaction.get(ref)).exists()) throw new Error('Esta obra ya está en tu lista.');
    transaction.set(ref, {
      tmdbId: obra.tmdbId,
      tipo: obra.tipo,
      titulo: [...obra.titulo].slice(0, 200).join(''),
      anio: obra.anio,
      posterPath: obra.posterPath,
      estado: 'por_ver',
      calificacionPersonal: null,
      comentario: '',
      vistaEn: null,
      ...metadatos,
      agregadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
    });
  });
  return leerConfirmada(uid, ref.id);
}
export async function actualizar(
  uid: string,
  id: string,
  cambios: CambiosEntrada,
): Promise<ItemLista> {
  const ref = referencia(uid, id);
  await runTransaction(obtenerDb(), async (transaction) => {
    const actual = convertir(await transaction.get(ref));
    if (!actual) throw new Error('Esta entrada ya no existe. Actualiza tu lista.');
    const plan = planificarTransicion(actual, cambios);
    const fecha =
      plan.fecha === 'servidor'
        ? { vistaEn: serverTimestamp() }
        : plan.fecha === 'borrar'
          ? { vistaEn: null }
          : {};
    transaction.update(ref, { ...plan.cambios, ...fecha, actualizadoEn: serverTimestamp() });
  });
  return leerConfirmada(uid, id);
}
export async function migrarFecha(uid: string, id: string): Promise<ItemLista | null> {
  const ref = referencia(uid, id);
  await runTransaction(obtenerDb(), async (transaction) => {
    const actual = convertir(await transaction.get(ref));
    if (!actual) return;
    const fecha = fechaParaMigrar(actual);
    if (fecha)
      transaction.update(ref, {
        vistaEn: Timestamp.fromDate(new Date(fecha)),
        actualizadoEn: serverTimestamp(),
      });
  });
  return convertir(await getDoc(referencia(uid, id)));
}
export async function completarMetadatos(
  uid: string,
  id: string,
  metadatos: MetadatosObra,
  anio: number,
  zonaHoraria: string,
): Promise<ItemLista | null> {
  const ref = referencia(uid, id);
  await runTransaction(obtenerDb(), async (transaction) => {
    const actual = convertir(await transaction.get(ref));
    if (
      !actual ||
      actual.estado !== 'vista' ||
      datosCompletos(actual) ||
      partesVisionado(actual.vistaEn, zonaHoraria)?.anio !== anio
    )
      return;
    transaction.update(ref, {
      ...normalizarMetadatos(actual.tipo, metadatos),
      actualizadoEn: serverTimestamp(),
    });
  });
  return convertir(await getDoc(referencia(uid, id)));
}
export async function eliminar(uid: string, id: string): Promise<void> {
  const ref = referencia(uid, id);
  await runTransaction(obtenerDb(), async (transaction) => {
    await transaction.get(ref);
    transaction.delete(ref);
  });
}
