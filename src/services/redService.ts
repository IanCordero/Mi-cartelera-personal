import NetInfo from '@react-native-community/netinfo';
// Implementación móvil: Expo selecciona redService.web.ts en navegador.
export function observarRed(callback: (conectado: boolean) => void): () => void {
  return NetInfo.addEventListener(state => callback(state.isConnected !== false && state.isInternetReachable !== false));
}
