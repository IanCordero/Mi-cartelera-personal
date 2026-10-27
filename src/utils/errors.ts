const MENSAJES: Record<string, string> = {
  'auth/invalid-email': 'El correo electrónico no es válido.',
  'auth/email-already-in-use': 'Este correo ya está registrado. Inicia sesión.',
  'auth/weak-password': 'La contraseña no cumple la política de seguridad del proyecto.',
  'auth/invalid-credential': 'El correo o la contraseña son incorrectos.',
  'auth/wrong-password': 'El correo o la contraseña son incorrectos.',
  'auth/user-not-found': 'El correo o la contraseña son incorrectos.',
  'auth/user-disabled': 'Esta cuenta está deshabilitada.',
  'auth/too-many-requests': 'Hay demasiados intentos. Espera unos minutos.',
  'auth/network-request-failed': 'No se pudo conectar. Revisa tu conexión a internet.',
  'auth/operation-not-allowed': 'Activa Email/Password en Firebase Authentication.',
  'auth/invalid-api-key': 'Revisa la configuración de Firebase en el archivo .env.',
  'auth/configuration-not-found': 'Activa Authentication en tu proyecto de Firebase.',
  'permission-denied': 'No tienes permiso. Revisa tu sesión y las reglas de Firestore.',
  'unauthenticated': 'Tu sesión no está disponible. Vuelve a iniciar sesión.',
  'unavailable': 'Firestore no está disponible. Se conserva la última copia de tu lista.',
  'deadline-exceeded': 'El servidor tardó demasiado. Vuelve a intentarlo.',
};
export function mensajeError(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string') {
    return MENSAJES[error.code.replace('firestore/', '')] ?? 'No se pudo completar la operación. Revisa la configuración y tu conexión.';
  }
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado. Inténtalo de nuevo.';
}
export class TiempoAgotado extends Error {
  constructor() { super('No se pudo confirmar la operación a tiempo. Actualiza tu lista antes de volver a intentarlo.'); }
}
export async function conTiempoMaximo<T>(promesa: Promise<T>, ms = 12000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([promesa, new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new TiempoAgotado()), ms);
    })]);
  } finally { if (timer) clearTimeout(timer); }
}
