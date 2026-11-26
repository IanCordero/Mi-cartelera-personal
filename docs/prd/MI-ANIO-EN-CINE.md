# PRD · Mi año en cine

Estado: propuesta para revisión del estudiante. Versión 1.0 · 25 de noviembre de 2026. Fuente de las decisiones de negocio: enunciado del docente. Base: Proyecto 3, commit p3-final. Este documento precede a la implementación de la épica.

## Problema y propósito

Mi Cartelera permite organizar títulos, pero no responder cuánto cine vio una persona durante un año ni cuáles fueron sus preferencias. El usuario necesita un resumen privado, comprensible y fiable, sin perder su lista anterior ni depender de internet para volver a consultar datos ya guardados.

## Usuario y experiencia esperada

Estudiante o aficionado que guarda películas/series y las califica después de verlas. Debe reconocer su año en pocos segundos: cantidad de historias, horas de películas, géneros, directores y meses. La interfaz mantiene el tono oscuro y lavanda de la app y presenta cifras claras, sin convertir el resumen en una competición.

## Objetivo y alcance

Agregar una pestaña Mi año en cine con selector de año, totales, horas, género/director más vistos, doce barras mensuales y obra destacada. Registrar fecha de visionado y metadatos TMDB. Migrar datos anteriores de forma gradual, idempotente y segura. Reutilizar autenticación, lista, caché, navegación y aislamiento por usuario.

Fuera de alcance: revisionados, compartir públicamente el resumen, ranking entre usuarios, modificar fechas manualmente, metas, recomendaciones por IA, rediseño de marca completo, proxy de TMDB y librerías de gráficas. No cambiar el SDK de Expo ni las cuentas/configuración privada del estudiante.

## Reglas de negocio del cliente

| Id  | Regla obligatoria                                                                                                                                                                                                                                      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D1  | vistaEn se guarda con serverTimestamp al pasar a Vista. Al salir de Vista queda null. Si vuelve a Vista se usa la fecha nueva. Editar estrellas/comentario sin cambiar de estado no modifica vistaEn.                                                  |
| D2  | Al abrir el resumen, todas las obras Vista sin vistaEn reciben la fecha de su actualizadoEn anterior. Se persiste una sola vez en Firestore. Una segunda apertura no cambia esa fecha.                                                                 |
| D3  | Cada obra se cuenta una vez en el año calendario de vistaEn según la hora local del teléfono. No hay revisionados.                                                                                                                                     |
| D4  | El selector ofrece los años con obras vistas y el año actual, sin duplicados, del más reciente al más antiguo. Abre en el año actual.                                                                                                                  |
| D5  | Al agregar desde TMDB se guardan generos (nombres en español, hasta 10), duracionMin (películas) y directores (películas, hasta 10). En series: duración null y directores vacíos.                                                                     |
| D6  | Al abrir el resumen se completan, de una en una y con progreso, las obras Vista del año elegido que carecen de esos datos. Un fallo TMDB no elimina la obra del total; la excluye de horas, género y director y se informa cuántas quedaron sin datos. |
| D7  | Horas = suma de duración de películas vistas / 60, con un decimal y formato español, por ejemplo 37,5 h. Las series no suman horas. Se indica cuántas películas no tienen duración.                                                                    |
| D8  | Cada obra aporta uno a cada género. Gana mayor cantidad; empate: mayor promedio personal entre sus obras calificadas; sin calificadas pierde ese desempate; si persiste, orden alfabético.                                                             |
| D9  | Cada película aporta uno a cada director; se aplica el desempate de D8. Las series no participan. Sin directores disponibles se muestra información insuficiente.                                                                                      |
| D10 | Mes más activo = mayor cantidad de obras; empate: el más reciente. Se muestran enero a diciembre, incluidos ceros.                                                                                                                                     |
| D11 | Destacada = mayor calificación personal; empate: vistaEn más reciente. Si nadie tiene calificación, se invita a calificar.                                                                                                                             |
| D12 | Un año sin obras vistas muestra un estado vacío y el botón Ir a Mi lista.                                                                                                                                                                              |
| D13 | Sin conexión se calcula desde AsyncStorage con aviso; no se migran fechas ni se completan metadatos.                                                                                                                                                   |

## Contrato de compatibilidad y datos

La ruta sigue siendo usuarios/{uid}/mi_lista/{tipo_tmdbId}. Las marcas de tiempo se guardan como Timestamp de Firestore y se representan con ISO en estado/caché, como en P3. Los cuatro campos nuevos deben ser opcionales en la lectura de documentos antiguos, pero las altas nuevas los incluyen. No convertir campos ausentes en arrays vacíos antes de decidir si falta una migración: ausencia y dato válido vacío tienen significados distintos.

1. Preparar fechas antiguas antes de enriquecer metadatos: D2 usa el actualizadoEn anterior, no el que genere la migración de TMDB.
2. Operaciones idempotentes con lectura transaccional del documento actual. Conservar título, estado, estrellas, comentario, identidad y fecha ya establecida.
3. No convertir un error de red en una escritura offline pendiente ni mostrar una mutación no confirmada como guardada.
4. Si el usuario cambia de cuenta o año durante la preparación, descartar respuestas de interfaz obsoletas. Una operación ya confirmada no debe duplicarse ni sobrescribir datos personales.
5. Mantener las reglas de P3 y agregar validación de campos nuevos, incluidas listas de texto, límites y duración positiva hasta 1000. En series, duración null y directores vacíos.

## Estados de experiencia

| Estado                      | Lo que ve el usuario                                       | Acción                                               |
| --------------------------- | ---------------------------------------------------------- | ---------------------------------------------------- |
| Cargando lista              | Indicador y “Estamos preparando tu año”                    | Esperar; no mostrar ceros como si fueran definitivos |
| Migrando fechas             | “Actualizando fechas de tu lista…” y avance                | Permitir volver; conservar operaciones confirmadas   |
| Completando TMDB            | “Completando datos · 3 de 8”                               | Consultar el avance; peticiones secuenciales         |
| Éxito                       | Resumen, selector y notas de datos faltantes               | Abrir destacada, cambiar año o volver a la lista     |
| Vacío                       | “Tu año todavía tiene historias por descubrir”             | Ir a Mi lista                                        |
| Sin conexión                | Última copia y aviso con fecha de caché                    | Consultar; volver a intentar al recuperar internet   |
| Parcial                     | Totales válidos y cantidad de obras sin metadatos/duración | Reintentar completar sin borrar lo conseguido        |
| Error sin datos disponibles | Explicación breve y Reintentar                             | Recuperar cuando haya conexión/permisos correctos    |
| Legado sin fecha offline    | Aviso de obras que necesitan recuperar fecha               | Conectarse para asignar el año de forma fiable       |

## Accesibilidad y privacidad

Contraste mínimo 4,5:1 en todos los pares de texto del sistema. Controles táctiles desde 44 unidades lógicas, etiquetas accesibles y texto junto al color/ícono. Las barras tienen etiqueta de mes/cantidad y no usan solo color. Respetar el tamaño de texto del sistema. Las tarjetas informativas no aparentan ser botones si no tienen acción.

El resumen es privado y se calcula por usuario. No hay nuevas colecciones públicas ni analítica externa. .env nunca se lee ni se comparte con el agente. TMDB mantiene logo y atribución en Acerca de y el brand board presenta su marca en tamaño secundario.

## Criterios de éxito

- Las cinco HU y D1–D13 tienen criterios y verificaciones trazables.
- No hay pérdida de entradas o campos personales al migrar ni duplicados de preparación.
- Vitest verifica dominio/fechas/desempates/transiciones y la regla de P3; la suite original sigue activa.
- El sensor de colores demuestra el rojo antes de migrar UI y el verde después.
- El resumen funciona con datos anteriores y con caché offline, indicando límites.
- El historial conserva documentos antes de código y tests rojos antes de implementación.
- Las pruebas reales de teléfono/Firebase se registran por el estudiante, sin resultados inventados.

## Puntos abiertos para consulta/revisión

| Id    | Punto no especificado o tensión                                                                      | Propuesta que debe confirmar el estudiante/cliente                                                                                                                    |
| ----- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PA-01 | El guion pide cambiar a un año vacío, pero D4 no permite años arbitrarios vacíos                     | Conservar D4. Para la demo, usar datos de un año anterior y dejar el año actual vacío; no añadir un año ficticio al selector.                                         |
| PA-02 | D11 no determina un ganador si dos obras tienen exactamente la misma calificación y el mismo vistaEn | Presentar una elección estable por itemId únicamente cuando ambos criterios obligatorios empatan; no afirmar que este tercer criterio lo decidió el docente.          |
| PA-03 | En offline una obra antigua Vista todavía puede no tener fecha                                       | No inferir un año ni escribir una migración. Mostrar aviso de pendientes de fecha; se incorporan al resumen después de D2 con conexión.                               |
| PA-04 | El enunciado exige fases rojas, pero también tests verdes antes de cada commit de código             | Registrar únicamente los commits rojos de los Hitos 2/3 que pide expresamente el docente. No quitar sensores ni usar --no-verify.                                     |
| PA-05 | Se pide Claude Code, pero el trabajo se está desarrollando con Codex                                 | Preparar el harness compatible y registrar qué se verificó aquí; el estudiante comprueba /context, /hooks y /commit en su equipo si el docente exige esa herramienta. |

Estas propuestas no se presentan como respuestas ya dadas por el cliente. Los casos especificados por D1–D13 tienen prioridad ante cualquier propuesta técnica.

## Referencias

SPEC.md (P3 reconstruido), docs/AUDITORIA.md, docs/backlog/EPICA-MI-ANIO.md, docs/diseno/BRIEF.md, docs/diseno/brand-board.html. La spec de implementación se escribirá en Hito 3 después de revisar este PRD y el sistema visual.
