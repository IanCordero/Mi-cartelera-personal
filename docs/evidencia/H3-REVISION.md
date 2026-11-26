# Revisión de dominio y datos preparada

Registro del estado previo a la revisión del estudiante, conservado como evidencia histórica. Fecha: 25 de noviembre de 2026. Estado: cambios de dominio/datos preparados y comprobados, todavía sin commits nuevos para estas fases. La spec y los tests tienen pendiente la revisión solicitada al estudiante. No hay interfaz anual implementada ni reglas productivas publicadas.

## Evidencia roja anterior a la implementación

- H2-colores-rojo.txt: sensor real falla con 18 literales fuera de src/tema.
- H3-dominio-rojo.txt: las tres suites no encuentran los módulos aún inexistentes; los archivos de tests y su salida se guardaron antes de escribirlos.
- H3-preparacion-rojo.txt: el test de preparación no encuentra su servicio todavía; salida guardada antes de implementarlo.

## Código preparado

- src/dominio: resumen y selector puros con zona horaria recibida; transiciones de visionado, migración de fecha, presencia/normalización de metadatos y plan offline.
- src/services/tmdbService.ts: crew Director junto a credits, géneros/duración/directores normalizados.
- src/services/listaService.ts: campos nuevos en altas, fechas de servidor al cambiar estado, migraciones transaccionales e idempotentes y lectura compatible con P3.
- src/services/preparacionService.ts: secuencia fechas → metadatos, progreso, fallo por obra, cancelación y detención ante una escritura incierta.
- src/context/CarteleraContext.tsx: resultados confirmados y caché por usuario; generics para el resultado de una mutación; preparación en cola, guardas de sesión y conciliación de respuestas tardías.
- firestore.rules: documentos antiguos permitidos, listas de texto hasta diez, fechas protegidas y duración de películas 1–1000; series sin duración/directores.
- src/tema/tokens.ts: inventario aprobado y medidas; todavía falta trasladar los colores de P3 y migrar su interfaz.

## Comprobaciones ejecutadas

| Comprobación                 | Resultado y alcance                                                    |
| ---------------------------- | ---------------------------------------------------------------------- |
| Vitest de dominio            | 46/46 aprobadas                                                        |
| Vitest de preparación        | 7/7 aprobadas                                                          |
| Vitest de tokens/contraste   | 14/14 aprobadas                                                        |
| Vitest de regresión P3       | 11/11 aprobadas                                                        |
| Vitest TMDB/metadatos        | 3/3 aprobadas, respuestas simuladas                                    |
| Total de suites enfocadas    | 81 aprobadas; no incluye el sensor de colores que está en su fase roja |
| Suite original Node          | 11/11 aprobadas; se conserva en npm run test:legado                    |
| Reglas Firestore en emulador | 15/15 aprobadas (8 anteriores conservadas y 7 nuevas)                  |
| TypeScript y lint            | Aprobados después de integrar los cambios                              |
| git diff --check             | Aprobado                                                               |

No se presenta npm test completo como verde: su sensor de colores sigue fallando de forma deliberada hasta la centralización que pide el proyecto. No se ha borrado ni excluido ningún archivo para ocultarlo. Las ejecuciones enfocadas permiten comprobar dominio/datos durante esa fase y no sustituyen la suite final completa.

## Revisión y ajuste de orden

La spec incluye la propuesta de centralizar los colores legados al crear tokens en H3, manteniendo la evidencia roja y reservando la adopción visual completa/nueva pestaña para H4. Resuelve la tensión del enunciado entre color rojo hasta H4 y tests verdes antes del commit de H3. Está pendiente de la revisión preguntada al estudiante.

La revisión humana de los cambios precede a sus commits. Los commits de documentos y tests se separarán de los de implementación para conservar la trazabilidad que se evalúa.

## Pendiente de ejecución real

Comprobar el proyecto en Expo Go, publicar las reglas en el Firebase propio del estudiante, probar dos cuentas reales, capturar un documento con los nuevos campos y completar docs/VERIFICACION.md a mano. Nada de lo anterior se da por hecho por haber pasado el emulador.

## Actualización después de la aprobación

El estudiante aprobó explícitamente spec, tests y orden de implementación. Se registraron primero el commit docs e82a969 y después los tests rojos 141aaa3. Luego se completó dominio/datos, centralización de colores y la interfaz H4. npm test ahora pasa completo: 82 tests Vitest y 11 originales de Node. TypeScript y lint pasan. Ver H4-tests-verde.txt y el informe de revisión final. Las reglas productivas y las pruebas personales siguen pendientes; no se ha confirmado el código nuevo sin su revisión humana final.
