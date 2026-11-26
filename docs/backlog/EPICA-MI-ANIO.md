# Épica A · Mi año en cine

Estado: backlog del Hito 2 revisado y aprobado por el estudiante. Fuente de negocio: PRD y decisiones D1–D13 del docente. No hay implementación nueva de la épica en este hito.

## Objetivo

Como usuario de Mi Cartelera, quiero recordar lo que vi durante cada año mediante un resumen privado y fiable, incluso cuando mi lista proviene del proyecto anterior o estoy sin conexión.

## HU-A.1 · Recordar cuándo vi cada obra

| Criterio | Regla | DADO / CUANDO / ENTONCES                                                                                                                     | Verificación prevista                              |
| -------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| CA-01    | D1    | DADO un título Por ver o Viendo, CUANDO pasa a Vista, ENTONCES vistaEn usa la hora del servidor y queda guardada.                            | Test de transición + emulador + teléfono           |
| CA-02    | D1    | DADO un título Vista con fecha, CUANDO cambia solo comentario o estrellas, ENTONCES la fecha original se conserva.                           | Dominio + regla de Firestore                       |
| CA-03    | D1    | DADO un título Vista, CUANDO pasa a otro estado, ENTONCES vistaEn y calificación quedan null.                                                | Dominio + regla + teléfono                         |
| CA-04    | D1/D3 | DADO un título que dejó de estar Vista, CUANDO vuelve a Vista, ENTONCES recibe una fecha nueva y cuenta una vez en su nuevo año.             | Dominio con reloj inyectado + emulador             |
| CA-05    | D5    | DADO el detalle TMDB de una película, CUANDO se agrega, ENTONCES se guardan sus géneros en español, duración y directores hasta los límites. | Normalización con respuestas simuladas + documento |
| CA-06    | D5    | DADA una serie, CUANDO se agrega, ENTONCES sus géneros se guardan, duracionMin es null y directores es [].                                   | Test de servicio/normalización + regla             |

## HU-A.2 · Consultar el resumen anual

| Criterio | Regla | DADO / CUANDO / ENTONCES                                                                                                                                           | Verificación prevista              |
| -------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| CA-07    | D3    | DADAS obras con fechas junto al límite de año UTC/local, CUANDO se resumen en la zona del teléfono, ENTONCES cada una pertenece al año local y se cuenta una vez.  | Vitest con zonas/fechas explícitas |
| CA-08    | D7    | DADAS películas con duración y series, CUANDO se calcula el año, ENTONCES las horas suman solo películas y se muestran con un decimal y coma.                      | Dominio + formato + UI             |
| CA-09    | D7    | DADA una película sin duración, CUANDO se resume, ENTONCES no suma horas y aparece en la cantidad sin duración.                                                    | Vitest + aviso                     |
| CA-10    | D8    | DADAS obras con varios géneros, CUANDO se determina el género top, ENTONCES cada obra aporta una vez a cada uno; gana la mayor cantidad.                           | Vitest                             |
| CA-11    | D8    | DADO un empate de cantidades, CUANDO hay calificaciones, ENTONCES gana el promedio mayor; un grupo sin calificadas pierde; si persiste, gana por orden alfabético. | Vitest: tres niveles de desempate  |
| CA-12    | D9    | DADAS películas con uno o más directores y series, CUANDO se calcula director top, ENTONCES solo las películas participan y se aplica el mismo desempate.          | Vitest                             |
| CA-13    | D9    | DADO un año sin directores disponibles, CUANDO se abre, ENTONCES la tarjeta explica que faltan datos y no inventa un nombre.                                       | Dominio + UI                       |
| CA-14    | D10   | DADOS los visionados del año, CUANDO se construyen barras, ENTONCES hay exactamente doce meses y los meses sin obras tienen cero.                                  | Vitest + etiquetas accesibles      |
| CA-15    | D10   | DADO un empate mensual, CUANDO se elige mes top, ENTONCES gana el mes más reciente.                                                                                | Vitest                             |
| CA-16    | D11   | DADAS obras calificadas, CUANDO se elige destacada, ENTONCES gana la mayor calificación y luego vistaEn más reciente.                                              | Vitest + abrir ficha               |
| CA-17    | D11   | DADO un año sin obras calificadas, CUANDO se abre, ENTONCES la tarjeta invita a calificar y no usa la puntuación TMDB como sustituto.                              | Vitest + UI                        |

## HU-A.3 · Cambiar de año

| Criterio | Regla | DADO / CUANDO / ENTONCES                                                                                                                                                          | Verificación prevista                |
| -------- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| CA-18    | D4    | DADAS obras Vista de varios años y un año actual recibido por parámetro, CUANDO se calculan opciones, ENTONCES son años con obras + actual, sin duplicados, en orden descendente. | aniosDisponibles en Vitest           |
| CA-19    | D4    | DADO el primer acceso a la pestaña, CUANDO abre, ENTONCES selecciona el año actual local del teléfono.                                                                            | UI con reloj controlado              |
| CA-20    | D3/D4 | DADO otro año disponible, CUANDO se selecciona, ENTONCES todas las tarjetas/barras/destacada se actualizan para ese año y no llegan resultados antiguos de otro año.              | Dominio + integración de preparación |

## HU-A.4 · Incluir obras anteriores sin perder datos

| Criterio | Regla | DADO / CUANDO / ENTONCES                                                                                                                                                                                 | Verificación prevista                                     |
| -------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| CA-21    | D2    | DADA una obra antigua Vista sin vistaEn y con actualizadoEn válido, CUANDO se abre el resumen online, ENTONCES vistaEn toma el actualizadoEn anterior, una sola vez, persistida en Firestore.            | Test de plan/migración + emulador                         |
| CA-22    | D2    | DADA la misma obra ya migrada, CUANDO se vuelve a abrir o editar su comentario, ENTONCES vistaEn no cambia ni se repite la migración.                                                                    | Idempotencia + reglas                                     |
| CA-23    | D6    | DADAS varias obras Vista del año elegido sin metadatos, CUANDO se preparan, ENTONCES se consulta una por vez con progreso n/total; no se enriquecen obras de otro año ni obras no vistas.                | Orquestador con servicio falso y máximo de concurrencia 1 |
| CA-24    | D6    | DADO un fallo TMDB para una obra, CUANDO termina la preparación, ENTONCES sigue contando en total/películas/series/mes y se excluye de horas/género/director; se informa pendiente y puede reintentarse. | Vitest + servicio simulado + UI                           |
| CA-25    | D2/D6 | DADAS migraciones y una edición concurrente, CUANDO se confirma cada documento, ENTONCES no se pierde estado, comentario, estrellas, identidad ni fecha ya guardada.                                     | Emulador + transacción concurrente                        |
| CA-26    | D5/D6 | DADOS datos válidos pero vacíos (géneros [], duración null, directores []), CUANDO se abre de nuevo, ENTONCES no se confunden con campos ausentes ni se consulta infinitamente TMDB.                     | Validador de presencia + idempotencia                     |

## HU-A.5 · Comprender estados vacíos e incompletos

| Criterio | Regla  | DADO / CUANDO / ENTONCES                                                                                                                          | Verificación prevista                     |
| -------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| CA-27    | D12    | DADO un año sin obras vistas, CUANDO abre, ENTONCES se muestra un vacío con Ir a Mi lista.                                                        | Dominio + navegación                      |
| CA-28    | D13    | DADA una copia local y ausencia de internet, CUANDO se abre, ENTONCES se calcula desde esa copia, muestra aviso y no llama migraciones ni TMDB.   | Plan de preparación + integración offline |
| CA-29    | D13    | DADAS obras antiguas sin fecha en caché, CUANDO abre offline, ENTONCES no se escribe ni asigna un año inventado y se avisa qué falta recuperar.   | Test + aviso; propuesta PA-03             |
| CA-30    | D6/D13 | DADO un error de carga y ninguna copia disponible, CUANDO abre, ENTONCES presenta error y Reintentar, sin mostrar un resumen de ceros como éxito. | Integración + UI                          |
| CA-31    | D6     | DADA la preparación en curso, CUANDO cambia de cuenta o de año, ENTONCES una respuesta antigua no modifica la pantalla de la sesión actual.       | Integración con respuestas retrasadas     |

## Tickets y dependencias

| Ticket | Entrega concreta                      | Criterios / dependencias | Definition of Done                                                                         |
| ------ | ------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------ |
| T-01   | Auditoría y referencia de P3          | RF1–RF10; base de todos  | Hallazgos con evidencia y revisión del estudiante registrada                               |
| T-02   | Harness, skill, hook y primer sensor  | T-01                     | npm test conserva legado, TypeScript y hook comprobados                                    |
| T-03   | PRD, backlog y brief                  | T-02                     | D1–D13 completos, criterios observables, puntos abiertos explícitos                        |
| T-04   | Brand board y DESIGN.md revisados     | T-03                     | Todas las secciones visuales, contrastes ≥4,5 y revisión humana real                       |
| T-05   | Sensor de colores primero en rojo     | T-04                     | Lista de colores fijos existente, salida roja conservada; no se desactiva                  |
| T-06   | Spec de implementación y trazabilidad | T-03/T-04                | Cada CA tiene verificación y cada cambio tiene ticket                                      |
| T-07   | Tests rojos de dominio                | T-06                     | Casos D1–D13 que son lógica guardados antes de implementación                              |
| T-08   | Fechas y transiciones puras           | T-07                     | CA-01–04, 07, 21–22 en verde; reloj/zona inyectados                                        |
| T-09   | Cálculo anual y selector              | T-07/T-08                | CA-08–18, 20, 24, 27 en verde; desempates completos                                        |
| T-10   | Metadatos TMDB en altas               | T-06                     | CA-05/06/26; crew tipado, límites y datos faltantes normalizados                           |
| T-11   | Persistencia compatible y reglas      | T-08/T-10                | Antiguos admitidos, nuevos validados, transiciones correctas y duración -5 denegada        |
| T-12   | Migraciones secuenciales y caché      | T-09/T-11                | CA-21–26/28–31; progreso, idempotencia, cancelación y aislamiento                          |
| T-13   | Tokens y migración visual de P3       | T-04/T-05                | Colores/espacios/tamaños en src/tema; sin modificar el logo oficial                        |
| T-14   | Componentes y pestaña anual           | T-09/T-12/T-13           | Plan por tickets aprobado, tarjetas/12 barras/selector/destacada accesibles                |
| T-15   | Estados, reintentos y navegación      | T-14                     | CA-19/20/27–31 visibles, Ir a Mi lista y edición funcionales                               |
| T-16   | Verificación, cierre y demo           | T-11–15                  | Tests/typecheck en verde, auditoría cerrada con límites y resultados humanos por completar |

## Definition of Done común

Spec previa, tipos estrictos, servicios separados, sin credenciales ni any injustificados; tests y TypeScript aprobados salvo fases rojas expresas; revisión del estudiante antes del commit; formato aplicado; respeto al diseño revisado y áreas táctiles ≥44; estados de carga/error/vacío/offline cuando correspondan. Las pruebas de teléfono y Firebase real se acreditan solo cuando el estudiante las ejecuta y registra lo obtenido.
