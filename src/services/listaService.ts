import { collection, doc, getDocs, runTransaction, serverTimestamp, Timestamp } from 'firebase/firestore/lite';
import { obtenerAuth, obtenerDb } from '../firebase/config';
import { CambiosEntrada, ItemLista, Obra } from '../types';
import { esItemLista, itemId, validarCambios } from '../utils/validation';
function exigirUsuario(uid: string): void {
  if (obtenerAuth().currentUser?.uid !== uid) throw new Error('La sesión cambió. Vuelve a abrir tu lista.');
}
function referencia(uid: string, id: string) {
  exigirUsuario(uid);
  if (!/^(movie|tv)_[1-9]\d*$/.test(id)) throw new Error('La entrada no es válida.');
  return doc(obtenerDb(), 'usuarios', uid, 'mi_lista', id);
}
export async function obtener(uid: string): Promise<ItemLista[]> {
  exigirUsuario(uid);
  const snapshot = await getDocs(collection(obtenerDb(), 'usuarios', uid, 'mi_lista'));
  return snapshot.docs.map(documento => {
    const datos = documento.data();
    const item: unknown = { ...datos, id: documento.id,
      agregadoEn: datos.agregadoEn instanceof Timestamp ? datos.agregadoEn.toDate().toISOString() : '',
      actualizadoEn: datos.actualizadoEn instanceof Timestamp ? datos.actualizadoEn.toDate().toISOString() : '' };
    if (!esItemLista(item)) throw new Error('Hay una entrada con datos inválidos en Firestore. Revisa sus campos.');
    return item;
  }).sort((a, b) => b.agregadoEn.localeCompare(a.agregadoEn));
}
export async function agregar(uid: string, obra: Obra): Promise<void> {
  const ref = referencia(uid, itemId(obra));
  await runTransaction(obtenerDb(), async transaction => {
    const actual = await transaction.get(ref);
    if (actual.exists()) throw new Error('Esta obra ya está en tu lista.');
    transaction.set(ref, { tmdbId: obra.tmdbId, tipo: obra.tipo,
      titulo: [...obra.titulo].slice(0, 200).join(''), anio: obra.anio, posterPath: obra.posterPath,
      estado: 'por_ver', calificacionPersonal: null, comentario: '',
      agregadoEn: serverTimestamp(), actualizadoEn: serverTimestamp() });
  });
}
export async function actualizar(uid: string, id: string, cambios: CambiosEntrada): Promise<void> {
  validarCambios(cambios);
  const ref = referencia(uid, id);
  await runTransaction(obtenerDb(), async transaction => {
    if (!(await transaction.get(ref)).exists()) throw new Error('Esta entrada ya no existe. Actualiza tu lista.');
    transaction.update(ref, { estado: cambios.estado, comentario: cambios.comentario,
      calificacionPersonal: cambios.calificacionPersonal, actualizadoEn: serverTimestamp() });
  });
}
export async function eliminar(uid: string, id: string): Promise<void> {
  const ref = referencia(uid, id);
  await runTransaction(obtenerDb(), async transaction => {
    await transaction.get(ref);
    transaction.delete(ref);
  });
}
