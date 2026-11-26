# Auditoría de Mi Cartelera Personal

## Alcance y procedencia

Auditoría inicial: 25 de noviembre de 2026. Repositorio: https://github.com/IanCordero/Mi-cartelera-personal. Base real: `94f278c` (Proyecto Mi Cartelera Personal). Se creó localmente la etiqueta `p3-final` sobre esa revisión y la rama `epica-mi-anio`, sin modificar main ni publicar cambios.

No se encontró SPEC.md en la base. Para no fingir que existía, se reconstruye una especificación de referencia a partir de los RF1–RF10 entregados originalmente. La reconstrucción se identifica expresamente en SPEC.md. Los resultados del proyecto anterior conservados en docs/PRUEBAS.md son históricos; no equivalen a verificaciones nuevas en el teléfono.

No se leyó ningún archivo .env. La revisión del historial por nombres no encontró .env, .env.local ni .env.production; la inspección automatizada de .env.example encontró cero credenciales rellenadas, sin imprimir valores.

## Resumen del proyecto que debe revisar el estudiante

La aplicación Expo SDK 58 y TypeScript organiza películas/series privadas. Login y registro usan Firebase Auth. React Navigation ofrece Buscar, Mi lista y Acerca de dentro de una pila con Detalle y Editar. CarteleraContext mantiene sesión, lista, conectividad y acciones; las pantallas no importan Firebase. Los servicios separan Auth, TMDB, Firestore Lite y AsyncStorage. La ruta es usuarios/{uid}/mi_lista/{tipo_id}. Una transacción evita duplicados y las reglas validan al propietario y la calificación solo en Vista. La caché es por uid y las respuestas de una sesión anterior se descartan.

## Comparación RF1–RF10

| RF   | Evidencia de código                                                                              | Resultado y límite                                                                      |
| ---- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| RF1  | src/firebase/config.ts: initializeAuth; src/services/authService.ts: observarSesion/entrar/salir | Implementado; persistencia real en teléfono por verificar por el estudiante             |
| RF2  | src/services/tmdbService.ts: buscar; src/screens/BuscarScreen.tsx: ejecutar                      | Tipos, paginación, carga/error/vacío y filtro de personas implementados                 |
| RF3  | tmdbService.obtenerDetalle; components/Poster.tsx; DetalleScreen                                 | Detalle con credits, reemplazo de póster y sinopsis/elenco vacíos                       |
| RF4  | listaService.agregar y Context.agregar                                                           | Id compuesto y transacción impiden altas duplicadas                                     |
| RF5  | MiListaScreen: filtrada                                                                          | Filtros por estado y tipo                                                               |
| RF6  | utils/validation.ts: validarCambios; EditarScreen: guardar; firestore.rules: valido              | Estrellas enteras 1–5 solo en Vista; límite 500 puntos Unicode                          |
| RF7  | EditarScreen: confirmar/borrar y Modal                                                           | Confirmación explícita antes de eliminar                                                |
| RF8  | cacheService; CarteleraContext.refrescar/mutar                                                   | Lectura offline con aviso; escritura solo online; se documenta incertidumbre de timeout |
| RF9  | AcercaScreen y components/TmdbLogo.tsx                                                           | Atribución, logo oficial y cierre de sesión                                             |
| RF10 | src/types, services, tsconfig, .gitignore                                                        | Capas y tipos estrictos; .env excluido; sin any explícito innecesario en src            |

## Hallazgos, evidencia y decisión

| Id   | Hallazgo                                                                                                | Evidencia (archivo y función)                                                        | Gravedad                                                          | Decisión                                                                                                                                                           |
| ---- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A-01 | No existe SPEC.md en la base; falta la referencia formal para la auditoría exigida                      | Árbol Git de 94f278c; README y docs/ARQUITECTURA.md sí existen                       | Media                                                             | Corregir ahora: reconstrucción honesta de RF1–RF10, antes de código nuevo                                                                                          |
| A-02 | El harness actual no incluye CLAUDE.md, skill /commit, hook de formato ni Vitest                        | AGENTS.md y package.json de 94f278c                                                  | Media                                                             | Corregir ahora en Hito 1 con spec propia y tests de la regla existente                                                                                             |
| A-03 | No hay vistaEn ni metadatos persistidos para calcular un año real                                       | types.ItemLista; listaService.agregar/actualizar; DetalleTmdb.credits solo tipa cast | Alta para la nueva épica; no es un incumplimiento de P3           | Corregir en Hito 3, después del PRD, criterios y spec; no inferir año desde agregadoEn                                                                             |
| A-04 | La allowlist actual rechaza los cuatro campos nuevos y las actualizaciones de migración                 | firestore.rules: valido y allow update                                               | Alta para la nueva épica                                          | Corregir en Hito 3; admitir documentos antiguos y probar transiciones, migración y aislamiento                                                                     |
| A-05 | Colores y medidas están repartidos entre theme y componentes/pantallas                                  | src/theme/index.ts; UI.tsx: Boton/Aviso; LoginScreen; EditarScreen; TmdbLogo.tsx     | Media                                                             | Corregir en Hito 4. El sensor se agregará primero en rojo en Hito 2; conservar el logo oficial sin redibujarlo                                                     |
| A-06 | Un documento inválido cancela la carga completa de la lista                                             | listaService.obtener: map y esItemLista                                              | Media                                                             | Corregir en la spec de compatibilidad: garantizar que los documentos antiguos válidos se aceptan; corrupción real queda con aviso y copia previa, sin borrar datos |
| A-07 | Un timeout no cancela la escritura remota y mantiene un bloqueo hasta su resolución                     | CarteleraContext.mutar; utils/errors.ts: conTiempoMaximo                             | Media                                                             | Riesgo conocido documentado; conservar conciliación y proteger también las migraciones                                                                             |
| A-08 | Los tipos de TMDB se afirman tras JSON; no hay un decoder completo de respuestas                        | tmdbService.pedirTmdb<T> y obtenerDetalle                                            | Media                                                             | Corregir los campos necesarios para metadatos con normalización y casos límite; decoder completo de todo TMDB fuera de alcance                                     |
| A-09 | No se acredita una prueba nueva en Expo Go ni reglas publicadas del proyecto real                       | docs/PRUEBAS.md: pendientes con cuentas reales                                       | Alta para acreditar la entrega; no demuestra un defecto de código | Verificar personalmente; no inventar capturas, datos de producción ni resultados humanos                                                                           |
| A-10 | Los avisos y controles accesibles existen, pero no hay sensor automático del contraste ni tokens únicos | theme/index.ts; components/UI.tsx                                                    | Media                                                             | Corregir después del brand board: contraste numérico y valores centralizados en src/tema                                                                           |

## Verificación inicial ejecutada en esta sesión

- npm ci --ignore-scripts: instalación completada desde package-lock.json.
- npm test (suite original): 11 pruebas aprobadas; TMDB simulado, sin cuentas privadas.
- npm run typecheck y npm run lint: aprobados en la base, sin leer .env.
- No se ejecutó Firebase real ni un teléfono. No se leyó .env.

## Harness preparado y verificado

AGENTS.md, CLAUDE.md, skill local /commit y hook Prettier preparados. npm test ejecuta 11 pruebas Vitest nuevas de la regla de P3 y conserva las 11 pruebas originales: 22 aprobadas. TypeScript, lint y git diff --check aprobados. El script del hook se comprobó con una entrada realista; su activación dentro de Claude Code no se presenta como verificada. Ver docs/evidencia/H1-VERIFICACION.md.

## Puertas de revisión del estudiante

1. Revisar y corregir este resumen y las decisiones de auditoría antes del primer commit nuevo.
2. Revisar el brand board antes de fijar DESIGN.md; no alterar decisiones de marca después sin su autorización.
3. Aprobar el plan por tickets de interfaz antes de implementarla.
4. Completar de puño propio los resultados obtenidos en el teléfono y ensayar la demo.

Estas puertas provienen del enunciado del docente, no de una limitación del programa. Las revisiones automáticas no se presentan como aprobación humana.

## Cierre

Pendiente: no hay auditoría final de una épica que todavía no se ha implementado. Se añadirá al terminar la verificación correspondiente, conservando esta sección inicial.

## Registro de revisión H1

El estudiante aprobó la auditoría y los cambios preparados del primer hito con el mensaje «Si Apruebo, para que puedas continuar», el 25 de noviembre de 2026. Esta autorización permite registrar los commits del Hito 1 y continuar con PRD y propuesta visual. No constituye una aprobación anticipada de un brand board que todavía no ha visto.
