export type EstadoVisto = 'por_ver' | 'viendo' | 'vista';
export type TipoMedio = 'movie' | 'tv';
export type Usuario = { uid: string; email: string | null };
export type EstadoPeticion<T> =
  | { tipo: 'cargando' }
  | { tipo: 'error'; mensaje: string }
  | { tipo: 'exito'; datos: T };
export const ETIQUETA_ESTADO: Record<EstadoVisto, string> = {
  por_ver: 'Por ver', viendo: 'Viendo', vista: 'Vista',
};
export interface Obra {
  tmdbId: number;
  tipo: TipoMedio;
  titulo: string;
  anio: string;
  posterPath: string | null;
}
export interface ItemLista extends Obra {
  id: string;
  estado: EstadoVisto;
  calificacionPersonal: number | null;
  comentario: string;
  // ISO en memoria/caché; serverTimestamp en Firestore.
  agregadoEn: string;
  actualizadoEn: string;
}
export type CambiosEntrada = Pick<ItemLista, 'estado' | 'calificacionPersonal' | 'comentario'>;
export interface Actor { id: number; name: string; character: string; profile_path: string | null }
export interface DetalleObra extends Obra {
  sinopsis: string;
  puntuacion: number;
  votos: number;
  generos: string[];
  duracion: number | null;
  elenco: Actor[];
}
export interface ResultadoBusqueda { resultados: Obra[]; pagina: number; totalPaginas: number; totalResultados: number }
export interface ResultadoTmdb {
  id: number;
  media_type?: string;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string | null;
}
export interface BusquedaTmdb { page: number; total_pages: number; total_results: number; results: ResultadoTmdb[] }
export interface DetalleTmdb extends ResultadoTmdb {
  overview?: string;
  vote_average: number;
  vote_count: number;
  genres: { id: number; name: string }[];
  runtime?: number;
  episode_run_time?: number[];
  credits?: { cast: Actor[] };
}
export interface ConfiguracionTmdb {
  images: { secure_base_url: string; poster_sizes: string[]; profile_sizes: string[] };
}
