import { readFileSync } from 'node:fs';
import { after, before, beforeEach, test } from 'node:test';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc, Timestamp, updateDoc } from 'firebase/firestore';
let env;
const proyecto = 'demo-cartelera';
const base = () => ({ tmdbId: 550, tipo: 'movie', titulo: 'Prueba', anio: '1999', posterPath: null,
  estado: 'por_ver', calificacionPersonal: null, comentario: '', agregadoEn: serverTimestamp(), actualizadoEn: serverTimestamp() });
const ref = (uid = 'A', cuenta = 'A', id = 'movie_550') => doc(env.authenticatedContext(cuenta).firestore(), 'usuarios', uid, 'mi_lista', id);
before(async () => { env = await initializeTestEnvironment({ projectId: proyecto,
  firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 } }); });
beforeEach(async () => { await env.clearFirestore(); });
after(async () => { await env?.cleanup(); });
test('A crea, lee, lista, actualiza y borra su propia entrada', async () => {
  await assertSucceeds(setDoc(ref(), base()));
  await assertSucceeds(getDoc(ref()));
  await assertSucceeds(getDocs(collection(env.authenticatedContext('A').firestore(), 'usuarios/A/mi_lista')));
  await assertSucceeds(updateDoc(ref(), { estado: 'vista', calificacionPersonal: 5, comentario: 'Buena', actualizadoEn: serverTimestamp() }));
  await assertSucceeds(deleteDoc(ref()));
});
test('B no puede leer, listar, crear, actualizar ni borrar datos de A', async () => {
  await setDoc(ref(), base());
  await assertFails(getDoc(ref('A', 'B')));
  await assertFails(getDocs(collection(env.authenticatedContext('B').firestore(), 'usuarios/A/mi_lista')));
  await assertFails(setDoc(ref('A', 'B', 'movie_551'), { ...base(), tmdbId: 551 }));
  await assertFails(updateDoc(ref('A', 'B'), { comentario: 'Intruso', actualizadoEn: serverTimestamp() }));
  await assertFails(deleteDoc(ref('A', 'B')));
});
test('sin autenticación se deniegan lectura y escritura', async () => {
  const anon = doc(env.unauthenticatedContext().firestore(), 'usuarios/A/mi_lista/movie_550');
  await assertFails(getDoc(anon)); await assertFails(setDoc(anon, base()));
});
test('se rechazan creación con estrellas/estado diferente y campos ajenos', async () => {
  await assertFails(setDoc(ref(), { ...base(), estado: 'vista', calificacionPersonal: 5 }));
  await assertFails(setDoc(ref(), { ...base(), extra: 'x' }));
  await assertFails(setDoc(ref(), { ...base(), comentario: 'prellenado' }));
});
test('id debe combinar tipo y número y los timestamps no pueden falsificarse', async () => {
  await assertFails(setDoc(ref('A', 'A', 'movie_551'), base()));
  await assertFails(setDoc(ref(), { ...base(), agregadoEn: Timestamp.fromMillis(1) }));
  await assertFails(setDoc(ref(), { ...base(), actualizadoEn: Timestamp.fromMillis(1) }));
  await assertFails(setDoc(ref(), { ...base(), tmdbId: -1 }));
});
test('las estrellas requieren Vista, enteros y rango 1 a 5; null sí se admite', async () => {
  await setDoc(ref(), base());
  for (const estado of ['por_ver', 'viendo']) await assertFails(updateDoc(ref(), { estado, calificacionPersonal: 3, actualizadoEn: serverTimestamp() }));
  for (const n of [0, 6, 1.5]) await assertFails(updateDoc(ref(), { estado: 'vista', calificacionPersonal: n, actualizadoEn: serverTimestamp() }));
  await assertSucceeds(updateDoc(ref(), { estado: 'vista', calificacionPersonal: 1, actualizadoEn: serverTimestamp() }));
  await assertFails(updateDoc(ref(), { estado: 'viendo', actualizadoEn: serverTimestamp() }));
  await assertSucceeds(updateDoc(ref(), { estado: 'viendo', calificacionPersonal: null, actualizadoEn: serverTimestamp() }));
});
test('500 caracteres sí, 501 no; identidad y agregadoEn inmutables', async () => {
  await setDoc(ref(), base());
  await assertSucceeds(updateDoc(ref(), { comentario: 'a'.repeat(500), actualizadoEn: serverTimestamp() }));
  await assertFails(updateDoc(ref(), { comentario: 'a'.repeat(501), actualizadoEn: serverTimestamp() }));
  await assertFails(updateDoc(ref(), { titulo: 'Otro', actualizadoEn: serverTimestamp() }));
  await assertFails(updateDoc(ref(), { agregadoEn: Timestamp.fromMillis(1), actualizadoEn: serverTimestamp() }));
});
test('película y serie con mismo id pueden coexistir; sobrescribir como alta no borra la opinión', async () => {
  await assertSucceeds(setDoc(ref(), base()));
  await assertSucceeds(setDoc(ref('A', 'A', 'tv_550'), { ...base(), tipo: 'tv' }));
  await assertSucceeds(updateDoc(ref(), { estado: 'vista', calificacionPersonal: 4, actualizadoEn: serverTimestamp() }));
  await assertFails(setDoc(ref(), base()));
});
