// Escuchamos online/offline directamente: NetworkInformation no está disponible
// de forma uniforme y sus eventos no siempre coinciden con navigator.onLine.
export function observarRed(callback: (conectado: boolean) => void): () => void {
  const informar = () => callback(navigator.onLine);
  informar();
  window.addEventListener('online', informar);
  window.addEventListener('offline', informar);
  return () => {
    window.removeEventListener('online', informar);
    window.removeEventListener('offline', informar);
  };
}
