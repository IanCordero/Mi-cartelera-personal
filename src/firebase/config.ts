import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseError, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, connectAuthEmulator, getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { connectFirestoreEmulator, Firestore, getFirestore } from 'firebase/firestore/lite';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};
export const camposFaltantes = Object.entries(firebaseConfig).filter(([, value]) => !value?.trim()).map(([key]) => key);
let auth: Auth | null = null;
let db: Firestore | null = null;
let errorConfiguracion: string | null = null;
if (camposFaltantes.length === 0) {
  try {
    const nuevo = getApps().length === 0;
    const app = nuevo ? initializeApp(firebaseConfig) : getApp();
    try {
      auth = Platform.OS === 'web' ? getAuth(app) : initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } catch (error) {
      if (error instanceof FirebaseError && error.code === 'auth/already-initialized') auth = getAuth(app);
      else throw error;
    }
    // Lite no mantiene una cola de escrituras offline; la copia offline es AsyncStorage.
    db = getFirestore(app);
    if (nuevo && process.env.EXPO_PUBLIC_USE_EMULATORS === 'true') {
      const host = process.env.EXPO_PUBLIC_EMULATOR_HOST || '127.0.0.1';
      connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
      connectFirestoreEmulator(db, host, 8080);
    }
  } catch { errorConfiguracion = 'No se pudo inicializar Firebase. Revisa los valores de .env y reinicia Expo.'; }
}
export function obtenerAuth(): Auth {
  if (!auth) throw new Error(errorConfiguracion ?? 'Completa las variables de Firebase en .env y reinicia Expo.');
  return auth;
}
export function obtenerDb(): Firestore {
  if (!db) throw new Error(errorConfiguracion ?? 'Completa las variables de Firebase en .env y reinicia Expo.');
  return db;
}
export function problemaConfiguracion(): string | null {
  return errorConfiguracion ?? (camposFaltantes.length ? `Faltan valores de Firebase: ${camposFaltantes.join(', ')}.` : null);
}
