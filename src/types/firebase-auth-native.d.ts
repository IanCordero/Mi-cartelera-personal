import 'firebase/auth';
import type { Persistence } from 'firebase/auth';
import type AsyncStorage from '@react-native-async-storage/async-storage';
// Firebase 12 exporta esta función en React Native, pero omite su declaración
// en la entrada de tipos web que TypeScript resuelve. Solo ampliamos el tipo;
// Metro sigue usando la implementación oficial con la condición react-native.
declare module 'firebase/auth' {
  export function getReactNativePersistence(
    storage: Pick<typeof AsyncStorage, 'getItem' | 'setItem' | 'removeItem'>,
  ): Persistence;
}
