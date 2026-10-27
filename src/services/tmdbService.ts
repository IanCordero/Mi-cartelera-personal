import { BusquedaTmdb, ConfiguracionTmdb, DetalleObra, DetalleTmdb, Obra, ResultadoBusqueda, ResultadoTmdb, TipoMedio } from '../types';
const BASE = 'https://api.themoviedb.org/3';
let configuracion: ConfiguracionTmdb['images'] | null = null;
let pendienteConfiguracion: Promise<void> | null = null;
export async function pedirTmdb<T>(ruta: string, params: Record<string, string> = {}, signal?: AbortSignal): Promise<T> {
  const token = process.env.EXPO_PUBLIC_TMDB_TOKEN?.trim();
  if (!token) throw new Error('Falta EXPO_PUBLIC_TMDB_TOKEN en .env. Agrega el API Read Access Token y reinicia Expo.');
  const controller = new AbortController();
  const cancelar = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener('abort', cancelar);
  const timeout = setTimeout(cancelar, 12000);
  try {
    const query = new URLSearchParams({ language: 'es-ES', ...params });
    const response = await fetch(`${BASE}${ruta}?${query}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }, signal: controller.signal,
    });
    if (!response.ok) {
      const errores: Record<number, string> = {
        401: 'El token de TMDB no es válido. Revisa el API Read Access Token de .env.',
        403: 'TMDB no autorizó esta solicitud.', 404: 'No se encontró esta obra.',
        429: 'TMDB recibió muchas peticiones. Espera unos segundos antes de buscar otra vez.',
      };
      throw new Error(errores[response.status] ?? 'TMDB no está disponible en este momento. Inténtalo más tarde.');
    }
    return await response.json() as T;
  } catch (error) {
    if (controller.signal.aborted) throw new Error('La petición se canceló o tardó demasiado. Inténtalo de nuevo.');
    if (error instanceof TypeError) throw new Error('No se pudo conectar con TMDB. Revisa tu conexión.');
    throw error;
  } finally { clearTimeout(timeout); signal?.removeEventListener('abort', cancelar); }
}
export async function prepararImagenes(): Promise<void> {
  if (configuracion) return;
  if (!pendienteConfiguracion) {
    pendienteConfiguracion = pedirTmdb<ConfiguracionTmdb>('/configuration').then(d => {
      configuracion = d.images;
    }).finally(() => { pendienteConfiguracion = null; });
  }
  await pendienteConfiguracion;
}
export function imagenUrl(path: string | null, grande = false, perfil = false): string | null {
  if (!path) return null;
  const tamanos = perfil ? configuracion?.profile_sizes : configuracion?.poster_sizes;
  const ideal = perfil ? 'w185' : grande ? 'w500' : 'w185';
  const tamano = tamanos?.includes(ideal) ? ideal : tamanos?.find(t => t !== 'original') ?? ideal;
  return `${configuracion?.secure_base_url ?? 'https://image.tmdb.org/t/p/'}${tamano}${path}`;
}
function normalizar(d: ResultadoTmdb, tipo: TipoMedio): Obra {
  return { tmdbId: d.id, tipo, titulo: d.title || d.name || 'Sin título',
    anio: (d.release_date || d.first_air_date || '').slice(0, 4), posterPath: d.poster_path ?? null };
}
export async function buscar(titulo: string, pagina = 1, signal?: AbortSignal): Promise<ResultadoBusqueda> {
  if (!titulo.trim()) return { resultados: [], pagina: 1, totalPaginas: 0, totalResultados: 0 };
  // Obtener configuración una sola vez; si falla, hay una URL HTTPS de respaldo.
  await prepararImagenes().catch(() => undefined);
  if (signal?.aborted) throw new Error('Búsqueda cancelada.');
  const d = await pedirTmdb<BusquedaTmdb>('/search/multi', {
    query: titulo.trim(), page: String(pagina), include_adult: 'false',
  }, signal);
  return { resultados: d.results.filter(r => r.media_type === 'movie' || r.media_type === 'tv')
    .map(r => normalizar(r, r.media_type as TipoMedio)),
    pagina: d.page, totalPaginas: Math.min(d.total_pages, 500), totalResultados: d.total_results };
}
export async function obtenerDetalle(tipo: TipoMedio, id: number, signal?: AbortSignal): Promise<DetalleObra> {
  await prepararImagenes().catch(() => undefined);
  if (signal?.aborted) throw new Error('Petición cancelada.');
  const d = await pedirTmdb<DetalleTmdb>(`/${tipo}/${id}`, { append_to_response: 'credits' }, signal);
  return { ...normalizar(d, tipo), sinopsis: d.overview?.trim() || 'Sin sinopsis disponible en español.',
    puntuacion: d.vote_average, votos: d.vote_count, generos: d.genres.map(g => g.name),
    duracion: d.runtime || d.episode_run_time?.[0] || null, elenco: d.credits?.cast.slice(0, 12) ?? [] };
}
