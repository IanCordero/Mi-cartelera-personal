// Valores trasladados del inventario y brand board aprobados; ver DESIGN.md.
export const colores = {
  fondo: '#0B0E17',
  superficie: '#151B2A',
  elevada: '#1D2538',
  borde: '#58667F',
  texto: '#F4F5FA',
  textoSecundario: '#A4AEC4',
  acento: '#AEABFF',
  acentoSuave: '#34315C',
  porVer: '#AEABFF',
  viendo: '#89C9FF',
  vista: '#8DE0BD',
  error: '#FF9AAB',
  fondoError: '#3D2131',
  fondoVista: '#19352E',
  fondoViendo: '#20334A',
  fondoPorVer: '#34315C',
  sombra: '#000000BB',
} as const;
export const espacio = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 20,
  xxl: 24,
  grande: 32,
  amplio: 40,
  extra: 48,
  maximo: 64,
} as const;
export const tipografia = {
  hero: 48,
  titulo: 32,
  seccion: 22,
  cuerpo: 16,
  etiqueta: 14,
  ayuda: 12,
  dato: 44,
} as const;
export const radio = {
  control: 14,
  tarjeta: 20,
  destacada: 24,
  pastilla: 999,
  poster: 12,
} as const;
export const peso = { normal: '400', medio: '600', fuerte: '700', destacado: '800' } as const;
export const lineas = {
  hero: 56,
  titulo: 38,
  seccion: 28,
  cuerpo: 24,
  etiqueta: 20,
  ayuda: 18,
  dato: 52,
} as const;
export const medidas = {
  tactilMinimo: 44,
  boton: 48,
  borde: 1,
  foco: 3,
  iconoMini: 12,
  iconoAviso: 20,
  comentarioMinimo: 150,
  textoVacioMaximo: 310,
  iconoPequeno: 18,
  icono: 22,
  iconoGrande: 32,
  iconoVacio: 42,
  // Dimensiones funcionales de póster conservadas de P3 y la destacada del board.
  poster: {
    base: 86,
    lista: 76,
    detalle: 135,
    elenco: 100,
    edicion: 70,
    destacada: 88,
    aspecto: 1.5,
  },
  tabs: { alto: 76, item: 48, inferiorMinimo: 12 },
  grafico: { maximo: 75, minimo: 2, contenedor: 136, anchoMaximo: 17 },
  logoTmdb: { ancho: 112, alto: 35 },
  vacioIcono: 76,
} as const;
export const interaccion = {
  presionado: 0.8,
  deshabilitado: 0.5,
  estrellasDeshabilitadas: 0.35,
} as const;
