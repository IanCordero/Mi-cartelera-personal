import { readFileSync } from 'node:fs';
import { after, before, beforeEach, test } from 'node:test';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
let env;
const proyecto = 'demo-cartelera';
const base = () => ({
  tmdbId: 550,
  tipo: 'movie',
  titulo: 'Prueba',
  anio: '1999',
  posterPath: null,
  estado: 'por_ver',
  calificacionPersonal: null,
  comentario: '',
  vistaEn: null,
  generos: [],
  duracionMin: null,
  directores: [],
  agregadoEn: serverTimestamp(),
  actualizadoEn: serverTimestamp(),
});
const ref = (uid = 'A', cuenta = 'A', id = 'movie_550') =>
  doc(env.authenticatedContext(cuenta).firestore(), 'usuarios', uid, 'mi_lista', id);
before(async () => {
  env = await initializeTestEnvironment({
    projectId: proyecto,
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
  });
});
beforeEach(async () => {
  await env.clearFirestore();
});
after(async () => {
  await env?.cleanup();
});
test('A crea, lee, lista, actualiza y borra su propia entrada', async () => {
  await assertSucceeds(setDoc(ref(), base()));
  await assertSucceeds(getDoc(ref()));
  await assertSucceeds(
    getDocs(collection(env.authenticatedContext('A').firestore(), 'usuarios/A/mi_lista')),
  );
  await assertSucceeds(
    updateDoc(ref(), {
      estado: 'vista',
      vistaEn: serverTimestamp(),
      calificacionPersonal: 5,
      comentario: 'Buena',
      actualizadoEn: serverTimestamp(),
    }),
  );
  await assertSucceeds(deleteDoc(ref()));
});
test('B no puede leer, listar, crear, actualizar ni borrar datos de A', async () => {
  await setDoc(ref(), base());
  await assertFails(getDoc(ref('A', 'B')));
  await assertFails(
    getDocs(collection(env.authenticatedContext('B').firestore(), 'usuarios/A/mi_lista')),
  );
  await assertFails(setDoc(ref('A', 'B', 'movie_551'), { ...base(), tmdbId: 551 }));
  await assertFails(
    updateDoc(ref('A', 'B'), { comentario: 'Intruso', actualizadoEn: serverTimestamp() }),
  );
  await assertFails(deleteDoc(ref('A', 'B')));
});
test('sin autenticación se deniegan lectura y escritura', async () => {
  const anon = doc(env.unauthenticatedContext().firestore(), 'usuarios/A/mi_lista/movie_550');
  await assertFails(getDoc(anon));
  await assertFails(setDoc(anon, base()));
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
  for (const estado of ['por_ver', 'viendo'])
    await assertFails(
      updateDoc(ref(), { estado, calificacionPersonal: 3, actualizadoEn: serverTimestamp() }),
    );
  for (const n of [0, 6, 1.5])
    await assertFails(
      updateDoc(ref(), {
        estado: 'vista',
        calificacionPersonal: n,
        actualizadoEn: serverTimestamp(),
      }),
    );
  await assertSucceeds(
    updateDoc(ref(), {
      estado: 'vista',
      vistaEn: serverTimestamp(),
      calificacionPersonal: 1,
      actualizadoEn: serverTimestamp(),
    }),
  );
  await assertFails(updateDoc(ref(), { estado: 'viendo', actualizadoEn: serverTimestamp() }));
  await assertSucceeds(
    updateDoc(ref(), {
      estado: 'viendo',
      vistaEn: null,
      calificacionPersonal: null,
      actualizadoEn: serverTimestamp(),
    }),
  );
});
test('500 caracteres sí, 501 no; identidad y agregadoEn inmutables', async () => {
  await setDoc(ref(), base());
  await assertSucceeds(
    updateDoc(ref(), { comentario: 'a'.repeat(500), actualizadoEn: serverTimestamp() }),
  );
  await assertFails(
    updateDoc(ref(), { comentario: 'a'.repeat(501), actualizadoEn: serverTimestamp() }),
  );
  await assertFails(updateDoc(ref(), { titulo: 'Otro', actualizadoEn: serverTimestamp() }));
  await assertFails(
    updateDoc(ref(), { agregadoEn: Timestamp.fromMillis(1), actualizadoEn: serverTimestamp() }),
  );
});
test('película y serie con mismo id pueden coexistir; sobrescribir como alta no borra la opinión', async () => {
  await assertSucceeds(setDoc(ref(), base()));
  await assertSucceeds(setDoc(ref('A', 'A', 'tv_550'), { ...base(), tipo: 'tv' }));
  await assertSucceeds(
    updateDoc(ref(), {
      estado: 'vista',
      vistaEn: serverTimestamp(),
      calificacionPersonal: 4,
      actualizadoEn: serverTimestamp(),
    }),
  );
  await assertFails(setDoc(ref(), base()));
});

test('D1: fecha de servidor al entrar, inmutable al comentar/calificar y null al salir', async () => {
  await setDoc(ref(), base());
  await assertFails(
    updateDoc(ref(), {
      estado: 'vista',
      vistaEn: Timestamp.fromMillis(1),
      actualizadoEn: serverTimestamp(),
    }),
  );
  await assertSucceeds(
    updateDoc(ref(), {
      estado: 'vista',
      vistaEn: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
    }),
  );
  const fecha = (await getDoc(ref())).data().vistaEn;
  await assertSucceeds(
    updateDoc(ref(), {
      comentario: 'Conservar',
      calificacionPersonal: 5,
      actualizadoEn: serverTimestamp(),
    }),
  );
  const despues = (await getDoc(ref())).data().vistaEn;
  if (!fecha.isEqual(despues)) throw new Error('Se cambió la fecha de visionado');
  await assertFails(
    updateDoc(ref(), { vistaEn: Timestamp.fromMillis(1), actualizadoEn: serverTimestamp() }),
  );
  await assertFails(
    updateDoc(ref(), {
      estado: 'viendo',
      calificacionPersonal: null,
      actualizadoEn: serverTimestamp(),
    }),
  );
  await assertSucceeds(
    updateDoc(ref(), {
      estado: 'viendo',
      vistaEn: null,
      calificacionPersonal: null,
      actualizadoEn: serverTimestamp(),
    }),
  );
  await assertSucceeds(
    updateDoc(ref(), {
      estado: 'vista',
      vistaEn: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
    }),
  );
});
test('D2: un documento antiguo puede leerse, editarse y migrar exactamente desde su actualizadoEn', async () => {
  const fecha = Timestamp.fromDate(new Date('2022-08-01T12:00:00Z'));
  await env.withSecurityRulesDisabled(async (contexto) => {
    await setDoc(doc(contexto.firestore(), 'usuarios/A/mi_lista/movie_550'), {
      tmdbId: 550,
      tipo: 'movie',
      titulo: 'Anterior',
      anio: '1999',
      posterPath: null,
      estado: 'vista',
      calificacionPersonal: 4,
      comentario: 'Opinión original',
      agregadoEn: fecha,
      actualizadoEn: fecha,
    });
  });
  await assertSucceeds(getDoc(ref()));
  await assertSucceeds(updateDoc(ref(), { vistaEn: fecha, actualizadoEn: serverTimestamp() }));
  await assertSucceeds(
    updateDoc(ref(), { comentario: 'Opinión editada', actualizadoEn: serverTimestamp() }),
  );
  const datos = (await getDoc(ref())).data();
  if (
    !datos.vistaEn.isEqual(fecha) ||
    datos.calificacionPersonal !== 4 ||
    datos.comentario !== 'Opinión editada'
  )
    throw new Error('Migración perdió información');
  await assertFails(
    updateDoc(ref(), { vistaEn: Timestamp.fromMillis(1), actualizadoEn: serverTimestamp() }),
  );
});
test('D2: no se puede migrar una fecha arbitraria en una Vista antigua', async () => {
  const fecha = Timestamp.fromMillis(1000);
  await env.withSecurityRulesDisabled(async (contexto) => {
    const datos = { ...base(), estado: 'vista', agregadoEn: fecha, actualizadoEn: fecha };
    delete datos.vistaEn;
    delete datos.generos;
    delete datos.duracionMin;
    delete datos.directores;
    await setDoc(doc(contexto.firestore(), 'usuarios/A/mi_lista/movie_550'), datos);
  });
  await assertFails(
    updateDoc(ref(), { vistaEn: Timestamp.fromMillis(2000), actualizadoEn: serverTimestamp() }),
  );
  await assertSucceeds(
    updateDoc(ref(), { comentario: 'Todavía no migrada', actualizadoEn: serverTimestamp() }),
  );
});
test('D5: nuevas altas requieren los campos nuevos; las listas son de texto y hasta diez', async () => {
  const incompleta = base();
  delete incompleta.generos;
  await assertFails(setDoc(ref(), incompleta));
  await assertFails(setDoc(ref(), { ...base(), generos: [7] }));
  await assertFails(setDoc(ref(), { ...base(), directores: [null] }));
  await assertFails(setDoc(ref(), { ...base(), generos: Array(11).fill('Drama') }));
  await assertFails(setDoc(ref(), { ...base(), directores: Array(11).fill('Director') }));
  await assertSucceeds(
    setDoc(ref(), {
      ...base(),
      generos: Array(10).fill('Drama'),
      directores: ['A', 'B'],
      duracionMin: 120,
    }),
  );
});
test('D5: duración negativa, fraccionaria, cero, excesiva o textual se rechaza', async () => {
  for (const duracionMin of [-5, 0, 1001, 90.5, '90'])
    await assertFails(setDoc(ref(), { ...base(), duracionMin }));
  await assertSucceeds(setDoc(ref(), { ...base(), duracionMin: 1000 }));
});
test('D5: series solo admiten duración null y directores vacíos', async () => {
  const serie = { ...base(), tipo: 'tv', generos: ['Drama'] };
  await assertFails(setDoc(ref('A', 'A', 'tv_550'), { ...serie, duracionMin: 45 }));
  await assertFails(setDoc(ref('A', 'A', 'tv_550'), { ...serie, directores: ['A'] }));
  await assertSucceeds(setDoc(ref('A', 'A', 'tv_550'), serie));
});
test('D6: completar metadatos conserva campos personales, identidad y fechas de visionado/agregado', async () => {
  await setDoc(ref(), base());
  await updateDoc(ref(), {
    estado: 'vista',
    vistaEn: serverTimestamp(),
    calificacionPersonal: 5,
    comentario: 'Mía',
    actualizadoEn: serverTimestamp(),
  });
  const antes = (await getDoc(ref())).data();
  await assertSucceeds(
    updateDoc(ref(), {
      generos: ['Drama'],
      duracionMin: 169,
      directores: ['Nolan'],
      actualizadoEn: serverTimestamp(),
    }),
  );
  const despues = (await getDoc(ref())).data();
  if (
    despues.comentario !== 'Mía' ||
    despues.calificacionPersonal !== 5 ||
    !despues.vistaEn.isEqual(antes.vistaEn) ||
    !despues.agregadoEn.isEqual(antes.agregadoEn)
  )
    throw new Error('Se perdieron datos personales');
});
