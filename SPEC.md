# Especificación de referencia del Proyecto 3

## Procedencia

Documento reconstruido el 25 de noviembre de 2026 a partir del enunciado RF1–RF10 proporcionado por el estudiante en la conversación original. No existía en el commit p3-final y no se presenta como escrito antes de aquel proyecto. Sirve para la auditoría de la base; la épica nueva tendrá su propio PRD, backlog y spec.

## Propósito y alcance

App móvil en Expo y TypeScript para buscar películas y series en TMDB y guardar una lista personal privada. Firebase Auth gestiona cuentas; Firestore guarda documentos en usuarios/{uid}/mi_lista/{tipo_tmdbId}. Se conserva una copia por usuario en AsyncStorage para consulta sin conexión.

## Requisitos funcionales

| Id   | Comportamiento esperado                                                                                    |
| ---- | ---------------------------------------------------------------------------------------------------------- |
| RF1  | Registro, login y logout con Firebase Auth, persistencia de sesión y errores traducidos                    |
| RF2  | Búsqueda por título de películas/series con carátula, título, año y estados carga/error/sin resultados     |
| RF3  | Detalle con póster, sinopsis, puntuación TMDB y elenco; reemplazos cuando falten datos                     |
| RF4  | Alta con estado Por ver y sin duplicados; identidad tipo_tmdbId                                            |
| RF5  | Mi lista con filtros Por ver/Viendo/Vista y película/serie                                                 |
| RF6  | Cambiar estado, estrellas enteras 1–5 y comentario de hasta 500 caracteres; solo Vista admite calificación |
| RF7  | Quitar una entrada únicamente tras confirmación                                                            |
| RF8  | Firestore y copia AsyncStorage; consulta offline con aviso; tiempos máximos de escritura                   |
| RF9  | Acerca de con logo/atribución TMDB y cierre de sesión                                                      |
| RF10 | TypeScript estricto, servicios separados de las pantallas y claves fuera del repositorio                   |

## Invariantes

- Los documentos pertenecen al uid de su ruta; otro usuario no puede leerlos ni modificarlos.
- AgregadoEn es inmutable; actualizadoEn se genera en el servidor.
- Una entrada que no está Vista tiene calificacionPersonal = null.
- Las pantallas no llaman directamente a Firebase ni hacen fetch de TMDB.
- Botones y elementos tocables tienen al menos 44 unidades lógicas de alto.
- El aviso literal de TMDB sigue visible y su marca es menos prominente que la de la app.

## Verificación

Suite original: npm test; TypeScript: npm run typecheck; lint: npm run lint; reglas en emulador: npm run test:rules. Las pruebas humanas/servicios reales se distinguen de las simuladas. Un bundle generado no demuestra una ejecución en Expo Go.
