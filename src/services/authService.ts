import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { obtenerAuth } from '../firebase/config';
import { Usuario } from '../types';
import { validarCredenciales } from '../utils/validation';

export function observarSesion(callback: (usuario: Usuario | null) => void): () => void {
  return onAuthStateChanged(obtenerAuth(), u => callback(u ? { uid: u.uid, email: u.email } : null));
}
export async function entrar(email: string, clave: string, registro: boolean): Promise<void> {
  const error = validarCredenciales(email, clave, registro);
  if (error) throw new Error(error);
  const metodo = registro ? createUserWithEmailAndPassword : signInWithEmailAndPassword;
  await metodo(obtenerAuth(), email.trim(), clave);
}
export async function salir(): Promise<void> { await signOut(obtenerAuth()); }
